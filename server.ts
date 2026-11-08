import express from 'express';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ServerLeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  protesterId: 'neha' | 'abhijit' | 'nsui' | 'genz' | 'minister' | 'warrior';
  levelId: string;
  score: number;
  timeMs: number;
  seasonRp: number;
  rankTier: string;
  updatedAt: string;
}

export interface RoomPlayerState {
  id: string;
  name: string;
  protesterId: 'neha' | 'abhijit' | 'nsui' | 'genz' | 'minister' | 'warrior';
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

interface RoomState {
  roomId: string;
  levelId: string;
  seed: number;
  raceStatus: 'waiting' | 'countdown' | 'active';
  countdownStartAt: number;
  players: Map<string, RoomPlayerState>;
  clients: Map<string, WebSocket>;
}

const initialLeaderboard: ServerLeaderboardEntry[] = [
  {
    id: 'seed_1',
    userId: 'usr_aarav_01',
    displayName: 'Aarav_SouthCampus',
    protesterId: 'warrior',
    levelId: 'sansad_marg',
    score: 2840,
    timeMs: 24600,
    seasonRp: 4250,
    rankTier: 'Jantar Mantar Legend',
    updatedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: 'seed_2',
    userId: 'usr_priya_02',
    displayName: 'Priya_VlogsLive',
    protesterId: 'genz',
    levelId: 'connaught_circle',
    score: 2610,
    timeMs: 26100,
    seasonRp: 3680,
    rankTier: 'Inquilab Leader',
    updatedAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
  {
    id: 'seed_3',
    userId: 'usr_kabir_03',
    displayName: 'Kabir_MukherjeeNgr',
    protesterId: 'abhijit',
    levelId: 'kartavya_monsoon',
    score: 2390,
    timeMs: 27800,
    seasonRp: 2940,
    rankTier: 'Inquilab Leader',
    updatedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: 'seed_4',
    userId: 'usr_simran_04',
    displayName: 'Simran_Morcha',
    protesterId: 'neha',
    levelId: 'sansad_marg',
    score: 2150,
    timeMs: 29400,
    seasonRp: 2410,
    rankTier: 'Barricade Breaker',
    updatedAt: new Date(Date.now() - 1000 * 60 * 88).toISOString(),
  },
  {
    id: 'seed_5',
    userId: 'usr_rohan_05',
    displayName: 'Rohan_NetaJi',
    protesterId: 'minister',
    levelId: 'jantar_siege',
    score: 1980,
    timeMs: 31200,
    seasonRp: 1890,
    rankTier: 'Barricade Breaker',
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'seed_6',
    userId: 'usr_dev_06',
    displayName: 'Dev_StudentUnion',
    protesterId: 'nsui',
    levelId: 'sansad_marg',
    score: 1740,
    timeMs: 33500,
    seasonRp: 1420,
    rankTier: 'Sadak Runner',
    updatedAt: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
  },
];

const rooms = new Map<string, RoomState>();

function getOrCreateRoom(roomId: string, levelId = 'sansad_marg'): RoomState {
  const cleanId = roomId.trim().toUpperCase().slice(0, 24) || 'DELHI-1';
  let room = rooms.get(cleanId);
  if (!room) {
    room = {
      roomId: cleanId,
      levelId,
      seed: Math.floor(100000 + Math.random() * 900000),
      raceStatus: 'waiting',
      countdownStartAt: 0,
      players: new Map(),
      clients: new Map(),
    };
    rooms.set(cleanId, room);
  }
  return room;
}

function broadcastToRoom(room: RoomState, message: unknown, excludePlayerId?: string) {
  const payload = JSON.stringify(message);
  for (const [pid, ws] of room.clients.entries()) {
    if (pid !== excludePlayerId && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  const httpServer = createHttpServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // REST API: Global & Seasonal Leaderboard
  app.get('/api/leaderboard', (req, res) => {
    const levelFilter = typeof req.query.levelId === 'string' ? req.query.levelId : 'all';
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'score';

    let list = [...initialLeaderboard];
    if (levelFilter !== 'all') {
      list = list.filter((item) => item.levelId === levelFilter);
    }

    if (sortBy === 'seasonRp') {
      list.sort((a, b) => b.seasonRp - a.seasonRp || b.score - a.score);
    } else if (sortBy === 'timeMs') {
      list.sort((a, b) => a.timeMs - b.timeMs || b.score - a.score);
    } else {
      list.sort((a, b) => b.score - a.score || a.timeMs - b.timeMs);
    }

    res.json({ entries: list.slice(0, 30) });
  });

  app.post('/api/leaderboard', (req, res) => {
    const body = req.body || {};
    const userId = String(body.userId || `guest_${Date.now()}`).slice(0, 128);
    const displayName = String(body.displayName || 'Anonymous Protester').trim().slice(0, 40);
    const protesterId = ['neha', 'abhijit', 'nsui', 'genz', 'minister', 'warrior'].includes(body.protesterId)
      ? body.protesterId
      : 'genz';
    const levelId = String(body.levelId || 'sansad_marg').slice(0, 40);
    const score = Math.max(0, Math.min(1000000, Math.round(Number(body.score) || 0)));
    const timeMs = Math.max(1000, Math.min(3600000, Math.round(Number(body.timeMs) || 30000)));
    const seasonRp = Math.max(0, Math.min(1000000, Math.round(Number(body.seasonRp) || score)));
    const rankTier = String(body.rankTier || 'Morcha Rookie').slice(0, 30);

    const existingIdx = initialLeaderboard.findIndex(
      (e) => e.userId === userId && e.levelId === levelId
    );

    const entry: ServerLeaderboardEntry = {
      id: existingIdx >= 0 ? initialLeaderboard[existingIdx].id : `run_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      displayName,
      protesterId,
      levelId,
      score: existingIdx >= 0 ? Math.max(initialLeaderboard[existingIdx].score, score) : score,
      timeMs: existingIdx >= 0 ? Math.min(initialLeaderboard[existingIdx].timeMs, timeMs) : timeMs,
      seasonRp: existingIdx >= 0 ? Math.max(initialLeaderboard[existingIdx].seasonRp, seasonRp) : seasonRp,
      rankTier,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      initialLeaderboard[existingIdx] = entry;
    } else {
      initialLeaderboard.push(entry);
    }

    // Also update user's seasonRp across all entries for consistent seasonal rank
    for (const item of initialLeaderboard) {
      if (item.userId === userId) {
        item.seasonRp = Math.max(item.seasonRp, seasonRp);
        item.rankTier = rankTier;
        item.displayName = displayName;
      }
    }

    res.json({ ok: true, entry });
  });

  app.get('/api/rooms', (_req, res) => {
    const activeRooms = Array.from(rooms.values()).map((r) => ({
      roomId: r.roomId,
      levelId: r.levelId,
      playerCount: r.players.size,
      raceStatus: r.raceStatus,
    }));
    res.json({ rooms: activeRooms });
  });

  // WebSocket Server for Real-Time Multiplayer & WebRTC Voice Chat Signaling
  wss.on('connection', (ws) => {
    let currentRoomId: string | null = null;
    let currentPlayerId: string | null = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        if (!msg || typeof msg.type !== 'string') return;

        if (msg.type === 'room:join') {
          const playerId = String(msg.playerId || `p_${Math.random().toString(36).slice(2, 9)}`).slice(0, 64);
          const roomId = String(msg.roomId || 'DELHI-1').toUpperCase().slice(0, 24);
          const name = String(msg.name || 'Runner').trim().slice(0, 32);
          const protesterId = ['neha', 'abhijit', 'nsui', 'genz', 'minister', 'warrior'].includes(msg.protesterId)
            ? msg.protesterId
            : 'genz';
          const rankTier = String(msg.rankTier || 'Morcha Rookie').slice(0, 30);
          const levelId = String(msg.levelId || 'sansad_marg').slice(0, 40);

          // Leave previous room if any
          if (currentRoomId && currentPlayerId) {
            const oldRoom = rooms.get(currentRoomId);
            if (oldRoom) {
              oldRoom.players.delete(currentPlayerId);
              oldRoom.clients.delete(currentPlayerId);
              broadcastToRoom(oldRoom, { type: 'player:left', playerId: currentPlayerId });
            }
          }

          currentPlayerId = playerId;
          currentRoomId = roomId;
          const room = getOrCreateRoom(roomId, levelId);

          const playerState: RoomPlayerState = {
            id: playerId,
            name,
            protesterId,
            rankTier,
            x: 0,
            y: 0,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            josh: 100,
            score: 0,
            progress: 0,
            status: 'lobby',
            isSpeaking: false,
            isMuted: true,
            calloutText: '',
            calloutTime: 0,
          };

          room.players.set(playerId, playerState);
          room.clients.set(playerId, ws);

          // Send full state to joining client
          ws.send(
            JSON.stringify({
              type: 'room:state',
              roomId: room.roomId,
              levelId: room.levelId,
              seed: room.seed,
              raceStatus: room.raceStatus,
              countdownStartAt: room.countdownStartAt,
              players: Array.from(room.players.values()),
            })
          );

          // Notify other peers in room (idempotent player:joined)
          broadcastToRoom(
            room,
            {
              type: 'player:joined',
              player: playerState,
            },
            playerId
          );
          return;
        }

        if (!currentRoomId || !currentPlayerId) return;
        const room = rooms.get(currentRoomId);
        if (!room) return;
        const player = room.players.get(currentPlayerId);
        if (!player) return;

        if (msg.type === 'player:move') {
          player.x = Number(msg.x) || 0;
          player.y = Number(msg.y) || 0;
          player.z = Number(msg.z) || 0;
          player.vx = Number(msg.vx) || 0;
          player.vy = Number(msg.vy) || 0;
          player.vz = Number(msg.vz) || 0;
          player.josh = Math.max(0, Math.min(100, Number(msg.josh) ?? player.josh));
          player.score = Math.max(0, Number(msg.score) ?? player.score);
          player.progress = Math.max(0, Math.min(1, Number(msg.progress) ?? player.progress));
          if (msg.status && ['lobby', 'running', 'completed', 'arrested'].includes(msg.status)) {
            player.status = msg.status;
          }

          broadcastToRoom(
            room,
            {
              type: 'player:moved',
              playerId: currentPlayerId,
              x: player.x,
              y: player.y,
              z: player.z,
              vx: player.vx,
              vy: player.vy,
              vz: player.vz,
              josh: player.josh,
              score: player.score,
              progress: player.progress,
              status: player.status,
            },
            currentPlayerId
          );
        } else if (msg.type === 'player:update_meta') {
          if (msg.name) player.name = String(msg.name).slice(0, 32);
          if (msg.protesterId && ['neha', 'abhijit', 'nsui', 'genz', 'minister', 'warrior'].includes(msg.protesterId)) {
            player.protesterId = msg.protesterId;
          }
          if (msg.rankTier) player.rankTier = String(msg.rankTier).slice(0, 30);
          broadcastToRoom(room, {
            type: 'player:joined',
            player,
          });
        } else if (msg.type === 'player:callout') {
          const text = String(msg.text || '').slice(0, 48);
          player.calloutText = text;
          player.calloutTime = Date.now();
          broadcastToRoom(room, {
            type: 'player:callout',
            playerId: currentPlayerId,
            name: player.name,
            text,
          });
        } else if (msg.type === 'race:start_countdown') {
          if (msg.levelId) room.levelId = String(msg.levelId).slice(0, 40);
          room.seed = Math.floor(100000 + Math.random() * 900000);
          room.raceStatus = 'countdown';
          room.countdownStartAt = Date.now();
          broadcastToRoom(room, {
            type: 'race:countdown',
            levelId: room.levelId,
            seed: room.seed,
            countdownStartAt: room.countdownStartAt,
          });
        } else if (msg.type === 'voice:state') {
          player.isMuted = Boolean(msg.isMuted);
          player.isSpeaking = Boolean(msg.isSpeaking);
          broadcastToRoom(
            room,
            {
              type: 'voice:state',
              playerId: currentPlayerId,
              isMuted: player.isMuted,
              isSpeaking: player.isSpeaking,
            },
            currentPlayerId
          );
        } else if (
          msg.type === 'voice:offer' ||
          msg.type === 'voice:answer' ||
          msg.type === 'voice:ice-candidate'
        ) {
          const targetId = String(msg.targetId || '');
          const targetWs = room.clients.get(targetId);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(
              JSON.stringify({
                type: msg.type,
                fromId: currentPlayerId,
                sdp: msg.sdp,
                candidate: msg.candidate,
              })
            );
          }
        }
      } catch {
        // Ignore malformed packets
      }
    });

    ws.on('close', () => {
      if (currentRoomId && currentPlayerId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          room.players.delete(currentPlayerId);
          room.clients.delete(currentPlayerId);
          broadcastToRoom(room, {
            type: 'player:left',
            playerId: currentPlayerId,
          });
          if (room.players.size === 0 && room.roomId !== 'DELHI-1') {
            rooms.delete(currentRoomId);
          }
        }
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`The Jantar Mantar Run server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
