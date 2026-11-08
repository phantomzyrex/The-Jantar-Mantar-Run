import { ProtesterId } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

export interface RemotePlayer {
  id: string;
  name: string;
  protesterId: ProtesterId;
  rankTier: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  josh: number;
  score: number;
  progress: number;
  status: 'lobby' | 'running' | 'completed' | 'arrested';
  isSpeaking: boolean;
  isMuted: boolean;
  calloutText: string;
  calloutTime: number;
}

type StateListener = () => void;

class MultiplayerAndVoiceClient {
  private ws: WebSocket | null = null;
  public playerId: string = `p_${Math.random().toString(36).slice(2, 9)}`;
  public roomId: string = 'DELHI-1';
  public isConnected = false;
  public players = new Map<string, RemotePlayer>();
  public roomLevelId = 'sansad_marg';
  public roomSeed = 421947;

  // WebRTC Voice Chat state
  public isMicEnabled = false;
  public isLocalSpeaking = false;
  public micPermissionError: string | null = null;
  private localStream: MediaStream | null = null;
  private peerConnections = new Map<string, RTCPeerConnection>();
  private remoteAudioElements = new Map<string, HTMLAudioElement>();
  private audioContext: AudioContext | null = null;
  private analyserTimer: number | null = null;

  private listeners = new Set<StateListener>();
  private onCountdownCallback: ((levelId: string, seed: number) => void) | null = null;
  private onRemoteCalloutCallback: ((name: string, text: string) => void) | null = null;

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public onRaceCountdown(cb: (levelId: string, seed: number) => void) {
    this.onCountdownCallback = cb;
  }

  public onRemoteCallout(cb: (name: string, text: string) => void) {
    this.onRemoteCalloutCallback = cb;
  }

  public connect(params: {
    playerId?: string;
    roomId: string;
    name: string;
    protesterId: ProtesterId;
    rankTier: string;
    levelId: string;
  }) {
    if (params.playerId) {
      this.playerId = params.playerId;
    }
    this.roomId = params.roomId.trim().toUpperCase() || 'DELHI-1';

    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    this.ws = ws;

    ws.onopen = () => {
      this.isConnected = true;
      ws.send(
        JSON.stringify({
          type: 'room:join',
          playerId: this.playerId,
          roomId: this.roomId,
          name: params.name,
          protesterId: params.protesterId,
          rankTier: params.rankTier,
          levelId: params.levelId,
        })
      );
      this.notify();
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (!msg || typeof msg.type !== 'string') return;

        if (msg.type === 'room:state') {
          this.roomId = msg.roomId;
          this.roomLevelId = msg.levelId || this.roomLevelId;
          this.roomSeed = msg.seed || this.roomSeed;
          this.players.clear();
          if (Array.isArray(msg.players)) {
            for (const p of msg.players) {
              this.players.set(p.id, p);
              if (p.id !== this.playerId && this.isMicEnabled) {
                this.initiatePeerOffer(p.id);
              }
            }
          }
          this.notify();
        } else if (msg.type === 'player:joined') {
          const p: RemotePlayer = msg.player;
          if (!p || !p.id) return;
          const isNew = !this.players.has(p.id);
          this.players.set(p.id, p);
          if (isNew && p.id !== this.playerId && this.isMicEnabled) {
            this.initiatePeerOffer(p.id);
          }
          this.notify();
        } else if (msg.type === 'player:left') {
          const pid = String(msg.playerId);
          this.players.delete(pid);
          this.closePeer(pid);
          this.notify();
        } else if (msg.type === 'player:moved') {
          const existing = this.players.get(msg.playerId);
          if (existing) {
            existing.x = msg.x;
            existing.y = msg.y;
            existing.z = msg.z;
            existing.vx = msg.vx;
            existing.vy = msg.vy;
            existing.vz = msg.vz;
            existing.josh = msg.josh;
            existing.score = msg.score;
            existing.progress = msg.progress;
            existing.status = msg.status;
          }
        } else if (msg.type === 'player:callout') {
          const p = this.players.get(msg.playerId);
          if (p) {
            p.calloutText = msg.text;
            p.calloutTime = Date.now();
          }
          soundEngine.playMegaphoneCallout();
          if (this.onRemoteCalloutCallback) {
            this.onRemoteCalloutCallback(msg.name || 'Protester', msg.text);
          }
          this.notify();
        } else if (msg.type === 'race:countdown') {
          this.roomLevelId = msg.levelId || this.roomLevelId;
          this.roomSeed = msg.seed || this.roomSeed;
          if (this.onCountdownCallback) {
            this.onCountdownCallback(this.roomLevelId, this.roomSeed);
          }
          this.notify();
        } else if (msg.type === 'voice:state') {
          const p = this.players.get(msg.playerId);
          if (p) {
            p.isMuted = Boolean(msg.isMuted);
            p.isSpeaking = Boolean(msg.isSpeaking);
            this.notify();
          }
        } else if (msg.type === 'voice:offer') {
          await this.handleVoiceOffer(msg.fromId, msg.sdp);
        } else if (msg.type === 'voice:answer') {
          await this.handleVoiceAnswer(msg.fromId, msg.sdp);
        } else if (msg.type === 'voice:ice-candidate') {
          await this.handleVoiceCandidate(msg.fromId, msg.candidate);
        }
      } catch {
        // ignore malformed message
      }
    };

    ws.onclose = () => {
      this.isConnected = false;
      this.notify();
    };
  }

  public sendMove(state: {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    josh: number;
    score: number;
    progress: number;
    status: 'lobby' | 'running' | 'completed' | 'arrested';
  }) {
    const self = this.players.get(this.playerId);
    if (self) {
      Object.assign(self, state);
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'player:move',
          ...state,
        })
      );
    }
  }

  public updateMeta(name: string, protesterId: ProtesterId, rankTier: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'player:update_meta',
          name,
          protesterId,
          rankTier,
        })
      );
    }
  }

  public sendCallout(text: string) {
    const self = this.players.get(this.playerId);
    if (self) {
      self.calloutText = text;
      self.calloutTime = Date.now();
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'player:callout',
          text,
        })
      );
    }
    soundEngine.playMegaphoneCallout();
    this.notify();
  }

  public requestRoomRaceStart(levelId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'race:start_countdown',
          levelId,
        })
      );
    }
  }

  // WebRTC Voice Chat Methods
  public async toggleVoiceChat(): Promise<boolean> {
    if (this.isMicEnabled) {
      this.disableVoiceChat();
      return false;
    }

    try {
      this.micPermissionError = null;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.localStream = stream;
      this.isMicEnabled = true;
      this.setupVoiceActivityDetector(stream);
      this.sendVoiceState(false, false);

      // Connect to all existing peers in the room
      for (const peerId of this.players.keys()) {
        if (peerId !== this.playerId) {
          await this.initiatePeerOffer(peerId);
        }
      }

      this.notify();
      return true;
    } catch {
      this.micPermissionError = 'Mic unavailable — using Quick Voice Chants';
      this.isMicEnabled = false;
      this.notify();
      return false;
    }
  }

  public disableVoiceChat() {
    this.isMicEnabled = false;
    this.isLocalSpeaking = false;
    if (this.analyserTimer !== null) {
      window.clearInterval(this.analyserTimer);
      this.analyserTimer = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    for (const pid of this.peerConnections.keys()) {
      this.closePeer(pid);
    }
    this.sendVoiceState(true, false);
    this.notify();
  }

  private setupVoiceActivityDetector(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      this.analyserTimer = window.setInterval(() => {
        if (!this.isMicEnabled) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += data[i];
        }
        const avg = sum / data.length;
        const speaking = avg > 18;
        if (speaking !== this.isLocalSpeaking) {
          this.isLocalSpeaking = speaking;
          const self = this.players.get(this.playerId);
          if (self) {
            self.isSpeaking = speaking;
            self.isMuted = false;
          }
          this.sendVoiceState(false, speaking);
          this.notify();
        }
      }, 140);
    } catch {
      // Fallback if AudioContext fails
    }
  }

  private sendVoiceState(isMuted: boolean, isSpeaking: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'voice:state',
          isMuted,
          isSpeaking,
        })
      );
    }
  }

  private getOrCreatePeerConnection(peerId: string): RTCPeerConnection {
    let pc = this.peerConnections.get(peerId);
    if (pc) return pc;

    pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          pc!.addTrack(track, this.localStream);
        }
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'voice:ice-candidate',
            targetId: peerId,
            candidate: event.candidate,
          })
        );
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        let audioEl = this.remoteAudioElements.get(peerId);
        if (!audioEl) {
          audioEl = new Audio();
          audioEl.autoplay = true;
          this.remoteAudioElements.set(peerId, audioEl);
        }
        audioEl.srcObject = remoteStream;
        audioEl.play().catch(() => {});
      }
    };

    this.peerConnections.set(peerId, pc);
    return pc;
  }

  private async initiatePeerOffer(peerId: string) {
    try {
      const pc = this.getOrCreatePeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'voice:offer',
            targetId: peerId,
            sdp: pc.localDescription,
          })
        );
      }
    } catch {
      // ignore peer offer error
    }
  }

  private async handleVoiceOffer(fromId: string, sdp: RTCSessionDescriptionInit) {
    try {
      const pc = this.getOrCreatePeerConnection(fromId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'voice:answer',
            targetId: fromId,
            sdp: pc.localDescription,
          })
        );
      }
    } catch {
      // ignore
    }
  }

  private async handleVoiceAnswer(fromId: string, sdp: RTCSessionDescriptionInit) {
    try {
      const pc = this.peerConnections.get(fromId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    } catch {
      // ignore
    }
  }

  private async handleVoiceCandidate(fromId: string, candidate: RTCIceCandidateInit) {
    try {
      const pc = this.peerConnections.get(fromId);
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch {
      // ignore
    }
  }

  private closePeer(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
    const audioEl = this.remoteAudioElements.get(peerId);
    if (audioEl) {
      audioEl.srcObject = null;
      this.remoteAudioElements.delete(peerId);
    }
  }
}

export const multiplayerClient = new MultiplayerAndVoiceClient();
