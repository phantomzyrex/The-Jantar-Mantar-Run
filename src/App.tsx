import React, { useCallback, useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Trophy,
  Target,
  Users,
  Shuffle,
  Pause,
  Play,
  LogIn,
  LogOut,
  Radio,
  ShieldAlert,
  RotateCcw,
  Sun,
  Wind,
  CloudRain,
  Sparkles,
} from 'lucide-react';
import {
  ComicCallout,
  DAILY_CHALLENGES,
  DYNAMIC_LEVELS,
  EmoteKey,
  getNextRankThreshold,
  PROTESTER_EMOTES,
  PROTESTERS,
  ProtesterId,
  RunTelemetry,
  WEATHER_CONFIGS,
  WeatherMode,
} from './types/game';
import { GamePhase, JantarMantarWorld } from './game/JantarMantarWorld';
import { ProtesterPortraitSvg, TitleBannerSvg } from './components/GameArtSvgs';
import { RankFlairBadge } from './components/RankFlairBadge';
import { soundEngine } from './audio/soundEngine';
import { multiplayerClient, RemotePlayer } from './network/multiplayerClient';
import {
  auth,
  loadOrCreatePlayerProfile,
  onAuthStateChanged,
  PlayerProfileDoc,
  saveCompletedRunAndProfile,
  signInWithGoogle,
  signOutUser,
  User,
} from './firebase';

interface LeaderboardRow {
  id: string;
  userId: string;
  displayName: string;
  protesterId: ProtesterId;
  levelId: string;
  score: number;
  timeMs: number;
  seasonRp: number;
  rankTier: string;
}

const DEFAULT_GUEST_PROFILE: PlayerProfileDoc = {
  userId: `guest_${Math.random().toString(36).slice(2, 8)}`,
  displayName: 'Dilli_Runner',
  protesterId: 'genz',
  seasonRp: 320,
  rankTier: 'Morcha Rookie',
  bestScore: 0,
  bestTimeMs: 0,
  totalRuns: 0,
  dailyChallengeIds: [],
};

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('title');
  const [protesterId, setProtesterId] = useState<ProtesterId>('genz');
  const [levelId, setLevelId] = useState<string>('sansad_marg');
  const [levelSeed, setLevelSeed] = useState<number>(421947);
  const [countdownNum, setCountdownNum] = useState<number | 'चलो!'>(3);
  const [clickCount, setClickCount] = useState<number>(14756);

  // Dynamic Weather state ('sunny' | 'dusty' | 'rainy') + Auto Dynamic Cycle
  const [weatherMode, setWeatherMode] = useState<WeatherMode>('sunny');
  const [autoWeatherCycle, setAutoWeatherCycle] = useState<boolean>(false);
  const [requestedEmote, setRequestedEmote] = useState<{
    key: EmoteKey;
    timestamp: number;
  } | null>(null);

  // Auth & Persistent Career Profile
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfileDoc>(DEFAULT_GUEST_PROFILE);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Live Run Telemetry & Comic Callouts
  const [telemetry, setTelemetry] = useState<RunTelemetry>({
    josh: 100,
    distanceM: 0,
    targetDistanceM: 500,
    timeSec: 0,
    score: 0,
    barricadesJumped: 0,
    closeDodges: 0,
    waterCannonHits: 0,
    sikhBoostsTaken: 0,
    halfwayShown: false,
    activeEmote: null,
  });
  const [callouts, setCallouts] = useState<ComicCallout[]>([]);
  const [lastRunSummary, setLastRunSummary] = useState<{
    status: 'completed' | 'arrested';
    earnedRp: number;
    newlyCompletedChallenges: string[];
  } | null>(null);

  // Multiplayer & Voice Chat state
  const [roomIdInput, setRoomIdInput] = useState<string>('DELHI-1');
  const [roomPlayers, setRoomPlayers] = useState<RemotePlayer[]>([]);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [isMutedAudio, setIsMutedAudio] = useState<boolean>(false);

  // Modals & Top Utility Bar
  const [activeModal, setActiveModal] = useState<
    'none' | 'leaderboard' | 'challenges' | 'multiplayer'
  >('none');
  const [showTopControls, setShowTopControls] = useState<boolean>(true);
  const [hideVictoryCard, setHideVictoryCard] = useState<boolean>(false);
  const [leaderboardRows, setLeaderboardRows] = useState<LeaderboardRow[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<'score' | 'seasonRp' | 'timeMs'>('score');
  const [leaderboardLevelFilter, setLeaderboardLevelFilter] = useState<string>('all');

  const currentLevel =
    DYNAMIC_LEVELS.find((l) => l.id === levelId) || DYNAMIC_LEVELS[0];
  const currentWeatherCfg = WEATHER_CONFIGS[weatherMode];

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const loaded = await loadOrCreatePlayerProfile(user);
          setProfile(loaded);
          setProtesterId(loaded.protesterId);
          multiplayerClient.updateMeta(
            loaded.displayName,
            loaded.protesterId,
            loaded.rankTier
          );
        } catch {
          // Keep fallback guest profile if offline
        }
      }
    });
    return () => unsub();
  }, []);

  // Connect to Real-Time Multiplayer & Voice Signaling Server
  useEffect(() => {
    multiplayerClient.connect({
      playerId: profile.userId,
      roomId: roomIdInput,
      name: profile.displayName,
      protesterId,
      rankTier: profile.rankTier,
      levelId,
    });

    const unsub = multiplayerClient.subscribe(() => {
      setRoomPlayers(Array.from(multiplayerClient.players.values()));
      setIsMicOn(multiplayerClient.isMicEnabled);
      setIsSpeaking(multiplayerClient.isLocalSpeaking);
      setMicNotice(multiplayerClient.micPermissionError);
    });

    multiplayerClient.onRaceCountdown((roomLvlId, seed) => {
      setLevelId(roomLvlId);
      setLevelSeed(seed);
      setActiveModal('none');
      startCountdownSequence();
    });

    multiplayerClient.onRemoteCallout((senderName, text) => {
      addCallout({
        text: `${senderName}: "${text}"`,
        x: 50,
        y: 22,
        variant: 'speech',
      });
    });

    return () => unsub();
  }, []);

  // Dynamic Auto-Weather Shift during active runs when enabled
  useEffect(() => {
    if (phase !== 'playing' || !autoWeatherCycle) return;
    const modes: WeatherMode[] = ['sunny', 'dusty', 'rainy'];
    const timer = window.setInterval(() => {
      setWeatherMode((prev) => {
        const nextIdx = (modes.indexOf(prev) + 1) % modes.length;
        const nextMode = modes[nextIdx];
        const cfg = WEATHER_CONFIGS[nextMode];
        addCallout({
          text: `मौसम बदला: ${cfg.labelHindi}`,
          subtext: `${cfg.labelEn} · ${cfg.frictionLabel}`,
          x: 50,
          y: 24,
          variant: 'banner',
        });
        return nextMode;
      });
    }, 11500);

    return () => window.clearInterval(timer);
  }, [phase, autoWeatherCycle]);

  // Fetch Global Leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/leaderboard?levelId=${encodeURIComponent(
          leaderboardLevelFilter
        )}&sortBy=${encodeURIComponent(leaderboardTab)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.entries)) {
          setLeaderboardRows(data.entries);
        }
      }
    } catch {
      // ignore offline
    }
  }, [leaderboardLevelFilter, leaderboardTab]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const addCallout = useCallback(
    (c: Omit<ComicCallout, 'id' | 'createdAt'>) => {
      const item: ComicCallout = {
        ...c,
        id: `co_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: Date.now(),
      };
      setCallouts((prev) => [...prev.slice(-4), item]);
    },
    []
  );

  // Auto-expire comic callouts after 1.35s
  useEffect(() => {
    if (callouts.length === 0) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setCallouts((prev) => prev.filter((c) => now - c.createdAt < 1350));
    }, 200);
    return () => window.clearInterval(timer);
  }, [callouts.length]);

  const startCountdownSequence = useCallback(() => {
    setCallouts([]);
    setLastRunSummary(null);
    setHideVictoryCard(false);
    setClickCount((c) => c + 1);
    setPhase('countdown');
    setCountdownNum(3);
    soundEngine.playCountdownTick(false);

    setTimeout(() => {
      setCountdownNum(2);
      soundEngine.playCountdownTick(false);
    }, 850);

    setTimeout(() => {
      setCountdownNum(1);
      soundEngine.playCountdownTick(false);
    }, 1700);

    setTimeout(() => {
      setCountdownNum('चलो!');
      soundEngine.playCountdownTick(true);
    }, 2550);

    setTimeout(() => {
      setPhase('playing');
    }, 3200);
  }, []);

  // Keyboard shortcuts for Title Screen (Enter/Space to Play), Pause (Esc), Toggle Top Bar (H)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
      ) {
        return;
      }

      if (e.code === 'KeyH' && phase === 'title' && activeModal === 'none') {
        setShowTopControls((prev) => !prev);
      } else if (
        (e.code === 'Enter' || e.code === 'Space') &&
        phase === 'title' &&
        activeModal === 'none'
      ) {
        e.preventDefault();
        setClickCount((c) => c + 1);
        setPhase('select_protester');
      } else if (e.code === 'Escape') {
        if (activeModal !== 'none') {
          setActiveModal('none');
        } else if (phase === 'playing') {
          setPhase('paused');
        } else if (phase === 'paused') {
          setPhase('playing');
        } else if (phase === 'select_protester') {
          setPhase('title');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, activeModal]);

  const handleSelectProtesterAndStart = (selectedId: ProtesterId) => {
    setProtesterId(selectedId);
    multiplayerClient.updateMeta(profile.displayName, selectedId, profile.rankTier);
    startCountdownSequence();
  };

  const handleRunFinished = useCallback(
    async (result: { status: 'completed' | 'arrested'; telemetry: RunTelemetry }) => {
      setPhase(result.status === 'completed' ? 'victory' : 'arrested');

      const t = result.telemetry;
      const lvl = DYNAMIC_LEVELS.find((l) => l.id === levelId) || DYNAMIC_LEVELS[0];

      // Evaluate Daily Challenges
      const newlyCompleted: string[] = [];
      let challengeBonusRp = 0;
      let challengeBonusScore = 0;

      for (const ch of DAILY_CHALLENGES) {
        if (profile.dailyChallengeIds.includes(ch.id)) continue;
        let passed = false;
        if (ch.metric === 'barricadesJumped' && t.barricadesJumped >= ch.target) {
          passed = true;
        } else if (ch.metric === 'closeDodges' && t.closeDodges >= ch.target) {
          passed = true;
        } else if (
          ch.metric === 'zeroWaterHitsWin' &&
          result.status === 'completed' &&
          t.waterCannonHits === 0
        ) {
          passed = true;
        } else if (
          ch.metric === 'fastWinUnder32s' &&
          result.status === 'completed' &&
          t.timeSec <= 32.0
        ) {
          passed = true;
        }

        if (passed) {
          newlyCompleted.push(ch.id);
          challengeBonusRp += ch.rewardRp;
          challengeBonusScore += ch.rewardScore;
        }
      }

      const baseRp =
        result.status === 'completed'
          ? lvl.rewardRpBonus + Math.round(t.score * 0.12)
          : Math.round(t.distanceM * 0.25);
      const totalEarnedRp = baseRp + challengeBonusRp;
      const finalScore = t.score + challengeBonusScore;

      setLastRunSummary({
        status: result.status,
        earnedRp: totalEarnedRp,
        newlyCompletedChallenges: newlyCompleted,
      });

      try {
        const updated = await saveCompletedRunAndProfile({
          user: currentUser,
          currentProfile: profile,
          protesterId,
          levelId,
          score: finalScore,
          timeMs: Math.round(t.timeSec * 1000),
          distanceM: t.distanceM,
          status: result.status,
          earnedRp: totalEarnedRp,
          newlyCompletedChallenges: newlyCompleted,
        });
        setProfile(updated);
        multiplayerClient.updateMeta(
          updated.displayName,
          updated.protesterId,
          updated.rankTier
        );
        fetchLeaderboard();
      } catch {
        // Non-fatal if offline
      }
    },
    [currentUser, fetchLeaderboard, levelId, profile, protesterId]
  );

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      // ignore popup close
    } finally {
      setAuthLoading(false);
    }
  };

  const handleToggleAudioMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMutedAudio(muted);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    multiplayerClient.connect({
      playerId: profile.userId,
      roomId: roomIdInput,
      name: profile.displayName,
      protesterId,
      rankTier: profile.rankTier,
      levelId,
    });
  };

  const nextRankInfo = getNextRankThreshold(profile.seasonRp);
  const progressPercent = Math.min(
    100,
    Math.round((telemetry.distanceM / Math.max(1, telemetry.targetDistanceM)) * 100)
  );
  const remainingMeters = Math.max(0, telemetry.targetDistanceM - telemetry.distanceM);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Isolated 60fps Three.js WebGL World Canvas */}
      <JantarMantarWorld
        phase={phase}
        protesterId={protesterId}
        levelId={levelId}
        levelSeed={levelSeed}
        weatherMode={weatherMode}
        requestedEmote={requestedEmote}
        onTelemetryUpdate={setTelemetry}
        onAddCallout={addCallout}
        onRunFinished={handleRunFinished}
      />

      {/* =====================================================================
          1. TITLE SCREEN OVERLAY (Matches Screenshot 2: Swallowtail Banner + Placard PLAY on Wooden Stick + Keycaps + Top Utility Bar)
         ===================================================================== */}
      {phase === 'title' && (
        <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">
          {/* Sleek Perimeter Top Utility Bar (Preserves 100% of the center and bottom 3D street vista!) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {showTopControls ? (
              <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-slate-950/90 border-2 border-slate-800 px-3 py-1.5 rounded-xl shadow-xl">
                <RankFlairBadge rankTier={profile.rankTier} size="sm" />
                <span className="text-xs font-mono tabular-nums text-amber-300 font-extrabold px-1.5 border-r border-slate-800">
                  {profile.seasonRp} RP
                </span>

                {/* Stage Selector */}
                <div className="flex items-center gap-1 pl-1">
                  {DYNAMIC_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        setLevelId(lvl.id);
                        setWeatherMode(lvl.defaultWeather);
                        setLevelSeed(Math.floor(100000 + Math.random() * 900000));
                      }}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        levelId === lvl.id
                          ? 'bg-red-600 text-amber-200 border border-amber-300'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {lvl.titleHindi}
                    </button>
                  ))}
                  <button
                    onClick={() => setLevelSeed(Math.floor(100000 + Math.random() * 900000))}
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 cursor-pointer"
                    title="Shuffle Dynamic Level Seed"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Weather Selector */}
                <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                  {(
                    [
                      { id: 'sunny', icon: Sun, label: 'Sunny' },
                      { id: 'dusty', icon: Wind, label: 'Smog' },
                      { id: 'rainy', icon: CloudRain, label: 'Rain' },
                    ] as const
                  ).map((w) => {
                    const Icon = w.icon;
                    const active = weatherMode === w.id;
                    return (
                      <button
                        key={w.id}
                        onClick={() => {
                          setWeatherMode(w.id);
                          setAutoWeatherCycle(false);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap cursor-pointer ${
                          active
                            ? 'bg-amber-400 text-slate-950 border-amber-200'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{w.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div />
            )}

            {/* Top-Right Feature Buttons (Multiplayer, Voice, Challenges, Leaderboard, Audio, Auth) */}
            <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setHideVictoryCard(true);
                  setPhase('victory');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-700/95 hover:bg-red-600 border-2 border-amber-300 text-xs font-extrabold text-amber-200 whitespace-nowrap cursor-pointer"
                title="Preview the 3D Jantar Mantar Observatory Complex after the Finish Line"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D Jantar Mantar</span>
              </button>

              <button
                onClick={() => setActiveModal('multiplayer')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 border-2 border-slate-800 text-xs font-bold text-sky-300 whitespace-nowrap cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>
                  {multiplayerClient.roomId} ({Math.max(1, roomPlayers.length)})
                </span>
              </button>

              <button
                onClick={() => multiplayerClient.toggleVoiceChat()}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-xs font-bold whitespace-nowrap cursor-pointer ${
                  isMicOn
                    ? 'bg-emerald-700 border-emerald-400 text-white'
                    : 'bg-slate-950/90 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{isMicOn ? (isSpeaking ? 'Speaking' : 'Voice On') : 'Voice'}</span>
              </button>

              <button
                onClick={() => setActiveModal('challenges')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 border-2 border-slate-800 text-xs font-bold text-amber-300 whitespace-nowrap cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" />
                <span>
                  Challenges ({profile.dailyChallengeIds.length}/{DAILY_CHALLENGES.length})
                </span>
              </button>

              <button
                onClick={() => {
                  fetchLeaderboard();
                  setActiveModal('leaderboard');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-950 text-xs font-extrabold whitespace-nowrap shadow-md cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Leaderboard</span>
              </button>

              <button
                onClick={handleToggleAudioMute}
                className="p-1.5 bg-slate-950/90 hover:bg-slate-900 border-2 border-slate-800 text-slate-200 rounded-lg cursor-pointer"
                title="Mute / Unmute Synth Audio"
              >
                {isMutedAudio ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {currentUser ? (
                <button
                  onClick={() => signOutUser()}
                  className="flex items-center gap-1 bg-slate-950/90 hover:bg-slate-900 border-2 border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.displayName}</span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="flex items-center gap-1 bg-slate-950/90 hover:bg-slate-900 text-amber-300 border-2 border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{authLoading ? '...' : 'Sign In'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Center Hero Lockup ("द जंतर मंतर रन / THE JANTAR MANTAR RUN" + Cream Placard PLAY on Wooden Stick + Keycap Row) */}
          <div className="flex flex-col items-center justify-center my-auto px-4">
            <TitleBannerSvg />

            {/* Cream Protest Placard "PLAY" Sign on Wooden Stick Handle (Exact match to Screenshot 2!) */}
            <div className="flex flex-col items-center -mt-2">
              <button
                onClick={() => {
                  setClickCount((c) => c + 1);
                  setPhase('select_protester');
                }}
                className="pointer-events-auto bg-[#fef9c3] hover:bg-white text-[#dc2626] border-[4px] border-[#0f172a] rounded-md px-11 py-2.5 shadow-[7px_7px_0px_#0f172a] hover:shadow-[9px_9px_0px_#0f172a] transition-all transform -rotate-2 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span className="font-['Bricolage_Grotesque',sans-serif] font-black italic text-4xl tracking-wider drop-shadow-[2px_2px_0px_#0f172a]">
                  PLAY
                </span>
              </button>
              {/* Wooden Stick Handle */}
              <div className="w-3.5 h-10 bg-[#a16207] border-x-[3px] border-b-[3px] border-[#0f172a] shadow-[3px_3px_0px_#0f172a] -mt-0.5 transform -rotate-2" />
            </div>

            {/* Keycap Hints Row (Exact match to Screenshot 2: [←] [→] move  [↑] [↓] run / back  [SPACE] jump) */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs font-extrabold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.85)]">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded shadow-[2px_2px_0px_#0f172a] font-mono text-xs">
                  ←
                </kbd>
                <kbd className="px-2 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded shadow-[2px_2px_0px_#0f172a] font-mono text-xs">
                  →
                </kbd>
                <span className="ml-1">move</span>
              </div>

              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded shadow-[2px_2px_0px_#0f172a] font-mono text-xs">
                  ↑
                </kbd>
                <kbd className="px-2 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded shadow-[2px_2px_0px_#0f172a] font-mono text-xs">
                  ↓
                </kbd>
                <span className="ml-1">run / back</span>
              </div>

              <div className="flex items-center gap-1">
                <kbd className="px-2.5 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded shadow-[2px_2px_0px_#0f172a] font-mono text-xs">
                  SPACE
                </kbd>
                <span className="ml-1">jump</span>
              </div>

              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-amber-300 text-slate-950 border-2 border-slate-950 rounded shadow-[2px_2px_0px_#0f172a] font-mono text-xs">
                  1–4
                </kbd>
                <span className="ml-1 text-amber-200">emote</span>
              </div>
            </div>
          </div>

          {/* Bottom-Left Clicks Badge (Matches Screenshot 1 & 2!) */}
          <div className="flex items-end justify-between">
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 border border-slate-700 px-3 py-1 rounded-full shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              <span className="text-xs font-extrabold text-amber-400 font-mono tabular-nums">
                {clickCount.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-200">clicks</span>
            </div>

            <button
              onClick={() => setShowTopControls((prev) => !prev)}
              className="pointer-events-auto bg-slate-950/85 hover:bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              {showTopControls ? 'Hide Top Bar (H)' : 'Show Top Bar (H)'}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. PROTESTER SELECTION SCREEN (Matches Screenshot 1 `image_c8609fd5.png` 100%!)
         ===================================================================== */}
      {phase === 'select_protester' && (
        <div className="fixed inset-0 z-20 bg-slate-950/45 flex flex-col justify-between p-5 overflow-y-auto">
          {/* Top-Left "← BACK" Cream Comic Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPhase('title')}
              className="bg-[#fef9c3] hover:bg-white text-slate-950 border-[3px] border-slate-950 rounded-md px-4 py-1.5 font-black italic text-sm shadow-[4px_4px_0px_#0f172a] hover:shadow-[6px_6px_0px_#0f172a] transition-transform active:scale-95 cursor-pointer"
            >
              ← BACK
            </button>

            <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold text-amber-200">
              <span>{currentLevel.titleHindi}</span>
              <span>·</span>
              <span>{currentWeatherCfg.labelEn}</span>
              <span>·</span>
              <span className="text-sky-300">Room: {multiplayerClient.roomId}</span>
            </div>
          </div>

          {/* Center Heading + 6 Tilted Cream Trading Cards + 3-Dot Hazard Legend */}
          <div className="my-auto flex flex-col items-center">
            <h1
              className="font-['Bricolage_Grotesque',sans-serif] font-black text-5xl sm:text-6xl text-[#facc15] tracking-wide select-none"
              style={{
                WebkitTextStroke: '2.5px #0f172a',
                textShadow: '4px 5px 0px #0f172a',
              }}
            >
              कौन चलेगा?
            </h1>
            <div className="mt-1 font-['Bricolage_Grotesque',sans-serif] font-black italic text-lg sm:text-xl text-white tracking-wider drop-shadow-[2px_3px_0px_#0f172a]">
              PICK YOUR PROTESTER
            </div>

            {/* 6 Tilted Cream Trading Cards matching `image_c8609fd5.png` */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 max-w-[1160px] w-full px-2">
              {PROTESTERS.map((p, idx) => {
                const isSelected = protesterId === p.id;
                const tilts = [
                  '-rotate-1',
                  'rotate-1',
                  '-rotate-1',
                  'rotate-1',
                  '-rotate-1',
                  'rotate-2',
                ];
                const tiltClass = tilts[idx % tilts.length];

                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProtesterAndStart(p.id)}
                    className={`group text-center bg-[#fefce8] hover:bg-white text-slate-950 border-[3.5px] border-slate-950 rounded-xl p-2.5 flex flex-col items-center justify-between shadow-[6px_6px_0px_#0f172a] hover:shadow-[9px_9px_0px_#0f172a] transition-all transform ${tiltClass} hover:rotate-0 hover:-translate-y-2 cursor-pointer ${
                      isSelected ? 'ring-4 ring-amber-400' : ''
                    }`}
                  >
                    {/* Halftone Portrait Frame */}
                    <div className="w-full border-[2.5px] border-slate-950 rounded-lg overflow-hidden bg-amber-100">
                      <ProtesterPortraitSvg id={p.id} className="w-full h-40" />
                    </div>

                    {/* Bold Italic Character Name & Tagline */}
                    <div className="w-full text-center mt-2.5 px-1">
                      <div className="font-['Bricolage_Grotesque',sans-serif] font-black italic text-lg text-slate-950 leading-none tracking-tight">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-700 font-semibold mt-1 leading-snug min-h-[30px] flex items-center justify-center">
                        {p.tagline}
                      </div>
                    </div>

                    {/* Bottom SPEED Capsule Bar */}
                    <div className="w-full mt-2.5 pt-1.5 flex items-center justify-center gap-2 px-1">
                      <span className="font-['Bricolage_Grotesque',sans-serif] font-black italic text-[11px] text-slate-950 tracking-wide">
                        SPEED
                      </span>
                      <div className="w-20 h-2.5 bg-[#fef9c3] border-2 border-slate-950 rounded-full overflow-hidden p-[1px]">
                        <div
                          className="h-full bg-[#dc2626] rounded-full"
                          style={{ width: `${p.speedStat}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Exact 3-Dot Hazard Legend from `image_c8609fd5.png` */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-extrabold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-slate-950 inline-block shadow" />
                <span>Police = 5 sec van ride</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-slate-950 inline-block shadow" />
                <span>Stick squad = -50% जान</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 border-2 border-slate-950 inline-block shadow" />
                <span>Barricade = jump it</span>
              </div>
            </div>
          </div>

          {/* Bottom-Left Clicks Counter + Mini Red Title Ribbon matching `image_c8609fd5.png` */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col items-start gap-1.5">
              <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-700 px-3 py-1 rounded-full shadow-lg">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                <span className="text-xs font-extrabold text-amber-400 font-mono tabular-nums">
                  {clickCount.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-200">clicks</span>
              </div>

              <div className="bg-red-600 border-2 border-slate-950 px-3 py-0.5 shadow-[3px_3px_0px_#0f172a] transform -rotate-2">
                <span className="font-['Bricolage_Grotesque',sans-serif] font-black text-sm text-amber-300 drop-shadow-[1px_1px_0px_#0f172a]">
                  द जंतर मंतर रन
                </span>
              </div>
            </div>

            <div className="text-xs font-bold text-amber-100 drop-shadow">
              Click any protester card to start the protest run
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. COUNTDOWN OVERLAY (3 - 2 - 1 - चलो!)
         ===================================================================== */}
      {phase === 'countdown' && (
        <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div className="transform -rotate-3 bg-amber-300 border-4 border-slate-950 px-12 py-6 shadow-[10px_10px_0px_#0f172a]">
            <span className="font-['Bricolage_Grotesque',sans-serif] font-black text-7xl text-red-600 drop-shadow-[0_4px_0px_#0f172a]">
              {countdownNum}
            </span>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. WORLD-MATCHED, LOW-OCCLUSION PERIMETER HUD (Playing / Countdown / Arrested)
         ===================================================================== */}
      {(phase === 'playing' || phase === 'countdown' || phase === 'arrested') && (
        <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">
          {/* Top Perimeter Bar: Left (जान / जोश), Center (Distance Progress + Weather), Right (TIME & अंक) */}
          <div className="flex items-start justify-between gap-4 w-full">
            {/* Top-Left: जान / जोश Stamina Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center bg-[#fffbeb] border-3 border-slate-950 shadow-[4px_4px_0px_#0f172a] p-1 transform -rotate-1">
                <div className="bg-red-600 text-white font-extrabold text-sm px-2.5 py-1 border-r-2 border-slate-950">
                  जान
                </div>
                <div className="w-36 sm:w-44 h-6 bg-slate-200 mx-1.5 border-2 border-slate-900 relative overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      telemetry.josh > 50
                        ? 'bg-emerald-500'
                        : telemetry.josh > 25
                        ? 'bg-amber-500'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${telemetry.josh}%` }}
                  />
                </div>
                <div className="font-mono tabular-nums font-extrabold text-xs text-slate-950 pr-2">
                  {Math.round(telemetry.josh)}%
                </div>
              </div>

              {/* Live Weather & Surface Friction Readout + Quick Cycle Button */}
              <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded text-[11px] text-slate-200">
                <button
                  onClick={() => {
                    const order: WeatherMode[] = ['sunny', 'dusty', 'rainy'];
                    const next = order[(order.indexOf(weatherMode) + 1) % order.length];
                    setWeatherMode(next);
                  }}
                  className="font-bold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Click to switch Weather"
                >
                  {weatherMode === 'sunny' && <Sun className="w-3.5 h-3.5" />}
                  {weatherMode === 'dusty' && <Wind className="w-3.5 h-3.5" />}
                  {weatherMode === 'rainy' && <CloudRain className="w-3.5 h-3.5" />}
                  <span>{currentWeatherCfg.labelEn}</span>
                </button>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">{currentWeatherCfg.frictionLabel}</span>
              </div>
            </div>

            {/* Top-Center: Tricolor Distance Progress Bar with Live Multiplayer Markers */}
            <div className="hidden md:flex items-center gap-2.5 bg-slate-950/90 border-2 border-slate-800 px-4 py-2 rounded-lg shadow-lg">
              <div className="w-56 lg:w-72 h-3 bg-slate-800 rounded-full relative overflow-visible border border-slate-600">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-white to-emerald-500 transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
                {roomPlayers
                  .filter((p) => p.id !== multiplayerClient.playerId)
                  .map((peer) => (
                    <div
                      key={peer.id}
                      className="w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-slate-950 absolute -top-0.5 -translate-x-1/2"
                      style={{ left: `${Math.min(100, Math.round(peer.progress * 100))}%` }}
                      title={peer.name}
                    />
                  ))}
                <div
                  className="w-4 h-4 rounded-full bg-red-600 border-2 border-white absolute -top-0.5 -translate-x-1/2 shadow"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>
              <span className="font-mono tabular-nums font-extrabold text-xs text-amber-300 whitespace-nowrap">
                {remainingMeters}M
              </span>
            </div>

            {/* Top-Right: TIME & अंक (Score) + Pause */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 bg-[#fffbeb] text-slate-950 border-3 border-slate-950 shadow-[4px_4px_0px_#0f172a] px-3 py-1.5 transform rotate-1">
                <div className="flex items-center gap-1">
                  <span className="bg-slate-950 text-white text-[10px] font-extrabold px-1.5 py-0.5">
                    TIME
                  </span>
                  <span className="font-mono tabular-nums font-extrabold text-sm">
                    {telemetry.timeSec.toFixed(1)}S
                  </span>
                </div>
                <div className="flex items-center gap-1 border-l-2 border-slate-300 pl-2.5">
                  <span className="bg-amber-300 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 border border-slate-900">
                    अंक
                  </span>
                  <span className="font-mono tabular-nums font-extrabold text-sm text-sky-700">
                    ★ {telemetry.score}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPhase('paused')}
                className="pointer-events-auto p-2 bg-slate-950/90 hover:bg-slate-900 text-white border-2 border-slate-800 rounded-lg cursor-pointer"
                title="Pause Game (ESC)"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Dynamic Comic Callout Bubbles */}
          <div className="relative flex-1 w-full pointer-events-none">
            {callouts.map((c) => {
              const isBurst =
                c.variant === 'whoosh' ||
                c.variant === 'hit' ||
                c.variant === 'sikh' ||
                c.variant === 'emote';
              const isBanner = c.variant === 'banner' || c.variant === 'arrest';

              return (
                <div
                  key={c.id}
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform"
                >
                  {isBanner ? (
                    <div className="bg-red-600 text-amber-200 border-4 border-slate-950 px-6 py-2.5 shadow-[6px_6px_0px_#0f172a] transform -rotate-2 text-center">
                      <div className="font-['Bricolage_Grotesque',sans-serif] font-black text-3xl tracking-wide">
                        {c.text}
                      </div>
                      {c.subtext && (
                        <div className="text-xs font-extrabold text-white mt-0.5">
                          {c.subtext}
                        </div>
                      )}
                    </div>
                  ) : isBurst ? (
                    <div
                      className={`border-3 border-slate-950 px-4 py-1.5 shadow-[4px_4px_0px_#0f172a] transform rotate-3 text-center ${
                        c.variant === 'whoosh'
                          ? 'bg-emerald-300 text-slate-950'
                          : c.variant === 'sikh'
                          ? 'bg-amber-300 text-slate-950'
                          : c.variant === 'emote'
                          ? 'bg-sky-300 text-slate-950'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      <div className="font-['Bricolage_Grotesque',sans-serif] font-black text-xl italic">
                        {c.text}
                      </div>
                      {c.subtext && (
                        <div className="font-mono tabular-nums text-[11px] font-extrabold">
                          {c.subtext}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white text-slate-950 border-3 border-slate-950 rounded-2xl px-3.5 py-1 shadow-[3px_3px_0px_#0f172a] font-extrabold text-xs whitespace-nowrap">
                      {c.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Perimeter: Voice Chants, Protester Emote Keys (1-4) & Run Stats */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            {/* Bottom-Left: Voice Chat & Megaphone Chants */}
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 border-2 border-slate-800 px-3 py-1.5 rounded-lg">
              <button
                onClick={() => multiplayerClient.toggleVoiceChat()}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                  isMicOn
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{isMicOn ? 'Mic Live' : 'Mic Muted'}</span>
              </button>

              <div className="hidden lg:flex items-center gap-1 border-l border-slate-800 pl-2">
                <Radio className="w-3.5 h-3.5 text-amber-400 mr-1" />
                {['चलो साथियों!', 'बच गया!', 'हम देखेंगे!'].map((chant) => (
                  <button
                    key={chant}
                    onClick={() => multiplayerClient.sendCallout(chant)}
                    className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[11px] font-bold text-amber-200 whitespace-nowrap cursor-pointer"
                  >
                    {chant}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom-Center: Protester Emotes Bar (Keys 1-4) */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/90 border-2 border-slate-800 px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-400 mr-1">EMOTES:</span>
              {([1, 2, 3, 4] as EmoteKey[]).map((key) => {
                const em = PROTESTER_EMOTES[key];
                const isActive = telemetry.activeEmote === key;
                return (
                  <button
                    key={key}
                    onClick={() => setRequestedEmote({ key, timestamp: Date.now() })}
                    className={`px-2 py-0.5 rounded border text-[11px] font-bold transition-transform active:scale-95 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 border-white scale-105'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span className="font-mono text-amber-300 mr-1">[{key}]</span>
                    <span>{em.nameEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom-Right: Barricades & Dodges Counter */}
            <div className="bg-slate-950/90 border-2 border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 font-mono tabular-nums">
              Barricades: {telemetry.barricadesJumped} · Dodges: {telemetry.closeDodges}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. PAUSE MODAL
         ===================================================================== */}
      {phase === 'paused' && (
        <div className="fixed inset-0 z-30 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-[#fffbeb] text-slate-950 border-4 border-slate-950 p-6 max-w-md w-full shadow-[10px_10px_0px_#0f172a]">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] font-black text-3xl text-red-600">
              मोर्चा रुका है — PAUSED
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-1">
              {currentLevel.titleHindi} ({currentLevel.titleEn}) · Weather: {currentWeatherCfg.labelEn}
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                onClick={() => setPhase('playing')}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-amber-200 border-3 border-slate-950 font-extrabold text-sm shadow-[4px_4px_0px_#0f172a] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>RESUME RUN (ESC)</span>
              </button>
              <button
                onClick={startCountdownSequence}
                className="w-full py-2.5 bg-amber-300 hover:bg-amber-200 text-slate-950 border-3 border-slate-950 font-extrabold text-sm shadow-[4px_4px_0px_#0f172a] flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESTART LEVEL</span>
              </button>
              <button
                onClick={() => setPhase('select_protester')}
                className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-950 border-3 border-slate-950 font-extrabold text-sm shadow-[4px_4px_0px_#0f172a] cursor-pointer"
              >
                SWITCH PROTESTER
              </button>
              <button
                onClick={() => setPhase('title')}
                className="w-full py-2 text-xs font-extrabold text-slate-600 hover:text-slate-950 cursor-pointer"
              >
                RETURN TO TITLE SCREEN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. VICTORY / ARRESTED ("PAKDA GAYA!") SUMMARY MODAL + 3D MONUMENT SHOWCASE
         ===================================================================== */}
      {(phase === 'victory' || phase === 'arrested') && (
        <div
          className={`fixed inset-0 z-30 flex flex-col justify-between p-4 ${
            phase === 'victory' && hideVictoryCard
              ? 'pointer-events-none'
              : 'bg-slate-950/60 items-center justify-center'
          }`}
        >
          {phase === 'victory' && hideVictoryCard ? (
            <div className="w-full h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="pointer-events-auto bg-slate-950/90 border-2 border-amber-400 px-4 py-2 rounded-xl shadow-xl">
                  <div className="font-['Bricolage_Grotesque',sans-serif] font-black text-lg text-amber-300">
                    जंतर मंतर वेधशाला (1724) · Jantar Mantar Observatory Complex
                  </div>
                  <div className="text-xs text-slate-300 font-semibold">
                    Samrat Yantra Sundial · Twin Ram Yantra Drums · Jai Prakash Bowls · Misra Yantra
                  </div>
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                  <button
                    onClick={() => setHideVictoryCard(false)}
                    className="px-4 py-2 bg-[#fef9c3] hover:bg-white text-slate-950 border-3 border-slate-950 font-extrabold text-xs shadow-[4px_4px_0px_#0f172a] cursor-pointer"
                  >
                    Show Run Summary
                  </button>
                  <button
                    onClick={() => setPhase('title')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-amber-200 border-3 border-slate-950 font-extrabold text-xs shadow-[4px_4px_0px_#0f172a] cursor-pointer"
                  >
                    Back to Title
                  </button>
                </div>
              </div>

              <div className="pointer-events-auto mx-auto bg-slate-950/90 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-bold text-amber-200">
                360° Finish Line Panorama · Samrat YantraEquinoctial Sundial & Heritage Plaza
              </div>
            </div>
          ) : (
            <div className="bg-[#fffbeb] text-slate-950 border-4 border-slate-950 p-6 max-w-lg w-full shadow-[12px_12px_0px_#0f172a]">
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`inline-block px-3 py-1 border-2 border-slate-950 font-extrabold text-xs ${
                    phase === 'victory'
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {phase === 'victory'
                    ? 'जंतर मंतर पहुँच गए! · VICTORY'
                    : 'पकड़ा गया! · 5 SEC VAN RIDE'}
                </div>

                {phase === 'victory' && (
                  <button
                    onClick={() => setHideVictoryCard(true)}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-slate-950 border-2 border-slate-950 text-[11px] font-extrabold cursor-pointer"
                  >
                    Inspect 3D Jantar Mantar Monument
                  </button>
                )}
              </div>

              <h2 className="font-['Bricolage_Grotesque',sans-serif] font-black text-3xl mt-2 text-slate-950">
                {phase === 'victory'
                  ? 'Morcha Reached Jantar Mantar!'
                  : 'Detained by Delhi Police Van!'}
              </h2>
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                {phase === 'victory'
                  ? 'Your protest march crossed the finish gate into the historic Jantar Mantar Observatory!'
                  : '"SIR, EK BYTE DE DIJIYE! KUCH KEHNA CHAHENGE?"'}
              </p>

              {/* Run Telemetry Grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-amber-100/80 border-2 border-slate-900 p-3">
                <div>
                  <div className="text-[10px] font-extrabold text-slate-500">SCORE (अंक)</div>
                  <div className="font-mono tabular-nums font-black text-lg text-red-600">
                    ★ {telemetry.score}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-slate-500">DISTANCE</div>
                  <div className="font-mono tabular-nums font-black text-lg text-slate-900">
                    {telemetry.distanceM}M
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-slate-500">TIME</div>
                  <div className="font-mono tabular-nums font-black text-lg text-slate-900">
                    {telemetry.timeSec.toFixed(1)}S
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-slate-500">SEASON RP</div>
                  <div className="font-mono tabular-nums font-black text-lg text-emerald-700">
                    +{lastRunSummary?.earnedRp || 0} RP
                  </div>
                </div>
              </div>

              {/* Seasonal Rank Progress Bar with Animated RankFlairBadge */}
              <div className="mt-3 bg-slate-950 text-white border-2 border-slate-900 p-3">
                <div className="flex items-center justify-between gap-2 text-xs font-extrabold">
                  <RankFlairBadge rankTier={profile.rankTier} size="sm" />
                  <span className="font-mono tabular-nums text-amber-300">
                    {profile.seasonRp} / {nextRankInfo.targetRp} RP
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 border border-slate-700 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((profile.seasonRp / nextRankInfo.targetRp) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {lastRunSummary && lastRunSummary.newlyCompletedChallenges.length > 0 && (
                <div className="mt-3 bg-emerald-100 border-2 border-emerald-800 p-2.5 text-xs font-bold text-emerald-950">
                  Daily Challenge Completed! Bonus RP credited to your Season 1 Rank.
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={startCountdownSequence}
                  className="py-2.5 bg-red-600 hover:bg-red-500 text-amber-200 border-3 border-slate-950 font-extrabold text-sm shadow-[4px_4px_0px_#0f172a] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RUN AGAIN</span>
                </button>

                <button
                  onClick={() => {
                    const idx = DYNAMIC_LEVELS.findIndex((l) => l.id === levelId);
                    const nextLvl = DYNAMIC_LEVELS[(idx + 1) % DYNAMIC_LEVELS.length];
                    setLevelId(nextLvl.id);
                    setWeatherMode(nextLvl.defaultWeather);
                    setLevelSeed(Math.floor(100000 + Math.random() * 900000));
                    startCountdownSequence();
                  }}
                  className="py-2.5 bg-amber-300 hover:bg-amber-200 text-slate-950 border-3 border-slate-950 font-extrabold text-sm shadow-[4px_4px_0px_#0f172a] cursor-pointer"
                >
                  NEXT STAGE
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPhase('select_protester')}
                  className="text-xs font-extrabold text-slate-700 hover:text-slate-950 underline cursor-pointer"
                >
                  Pick Another Protester
                </button>
                <button
                  onClick={() => {
                    fetchLeaderboard();
                    setPhase('title');
                    setActiveModal('leaderboard');
                  }}
                  className="text-xs font-extrabold text-red-700 hover:text-red-900 underline cursor-pointer"
                >
                  View Global Leaderboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          7. GLOBAL LEADERBOARD & SEASONAL RANKING MODAL (with RankFlairBadge)
         ===================================================================== */}
      {activeModal === 'leaderboard' && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white border-2 border-slate-700 rounded-xl max-w-4xl w-full p-6 shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-['Bricolage_Grotesque',sans-serif] font-black text-2xl text-amber-300">
                    Global Leaderboard & Season 1 Rankings
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Season 1: जन आंदोलन · Top-tier badges unlocked for Street Legend & Protest Leader
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RankFlairBadge rankTier={profile.rankTier} size="sm" />
                <button
                  onClick={() => setActiveModal('none')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 my-4">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setLeaderboardTab('score')}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                    leaderboardTab === 'score'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Top Score (अंक)
                </button>
                <button
                  onClick={() => setLeaderboardTab('seasonRp')}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                    leaderboardTab === 'seasonRp'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Seasonal RP
                </button>
                <button
                  onClick={() => setLeaderboardTab('timeMs')}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                    leaderboardTab === 'timeMs'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fastest Time
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLeaderboardLevelFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-bold border cursor-pointer ${
                    leaderboardLevelFilter === 'all'
                      ? 'bg-red-600 text-white border-red-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  All Stages
                </button>
                {DYNAMIC_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setLeaderboardLevelFilter(lvl.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold border cursor-pointer ${
                      leaderboardLevelFilter === lvl.id
                        ? 'bg-red-600 text-white border-red-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {lvl.titleHindi}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard Table with Animated RankFlairBadge */}
            <div className="overflow-y-auto flex-1 border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Protester</th>
                    <th className="py-2.5 px-3">Season Flair Badge</th>
                    <th className="py-2.5 px-3">Character</th>
                    <th className="py-2.5 px-3 text-right">Season RP</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                    <th className="py-2.5 px-3 text-right">Score (अंक)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 font-mono tabular-nums">
                  {leaderboardRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={
                        row.userId === profile.userId
                          ? 'bg-amber-500/15 font-bold'
                          : 'hover:bg-slate-800/50'
                      }
                    >
                      <td className="py-2.5 px-3 font-bold text-amber-300">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-white">
                        {row.displayName}
                      </td>
                      <td className="py-2 px-3 font-sans">
                        <RankFlairBadge
                          rankTier={row.rankTier}
                          position={idx + 1}
                          size="sm"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-sans uppercase text-slate-300">
                        {row.protesterId}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">
                        {row.seasonRp} RP
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {(row.timeMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        ★ {row.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          8. DAILY CHALLENGES MODAL
         ===================================================================== */}
      {activeModal === 'challenges' && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white border-2 border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="font-['Bricolage_Grotesque',sans-serif] font-black text-2xl text-amber-300">
                  आज की चुनौतियाँ · Daily Challenges
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete daily objectives during any run for extra Season 1 RP & Score rewards
                </p>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DAILY_CHALLENGES.map((ch) => {
                const isDone = profile.dailyChallengeIds.includes(ch.id);
                return (
                  <div
                    key={ch.id}
                    className={`p-4 rounded-lg border ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-600'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-amber-300">
                        {ch.titleHindi} · {ch.titleEn}
                      </span>
                      <span className="text-xs font-mono tabular-nums font-bold text-emerald-400">
                        {isDone ? 'COMPLETED' : `+${ch.rewardRp} RP`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5">{ch.description}</p>
                    <div className="mt-3 text-[11px] font-mono tabular-nums text-slate-400">
                      Extra Reward: ★ +{ch.rewardScore} अंक
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          9. MULTIPLAYER LOBBY & LIVE VOICE CHAT MODAL
         ===================================================================== */}
      {activeModal === 'multiplayer' && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white border-2 border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="font-['Bricolage_Grotesque',sans-serif] font-black text-2xl text-sky-300">
                  Live Multiplayer & Voice Chat Room
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Share a Room Code to run together in real time with peer-to-peer WebRTC voice chat
                </p>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleJoinRoom} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  YOUR PROTEST HANDLE
                </label>
                <input
                  type="text"
                  value={profile.displayName}
                  maxLength={32}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, displayName: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  ROOM CODE
                </label>
                <input
                  type="text"
                  value={roomIdInput}
                  maxLength={16}
                  onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-300 uppercase"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-lg cursor-pointer"
                >
                  Join / Sync Room
                </button>
              </div>
            </form>

            {micNotice && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-700/60 px-3 py-2 rounded-lg">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{micNotice}</span>
              </div>
            )}

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span>ACTIVE RUNNERS IN ROOM ({roomPlayers.length})</span>
                <button
                  onClick={() => multiplayerClient.toggleVoiceChat()}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                    isMicOn ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>{isMicOn ? 'WebRTC Voice Active' : 'Enable Microphone'}</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {roomPlayers.map((rp) => (
                  <div
                    key={rp.id}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white">{rp.name}</span>
                      <span className="text-slate-500">·</span>
                      <span className="uppercase text-amber-300 font-bold">{rp.protesterId}</span>
                      <RankFlairBadge rankTier={rp.rankTier} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="text-sky-400">{Math.round(rp.progress * 100)}%</span>
                      <span
                        className={`text-[11px] font-sans font-bold ${
                          rp.isSpeaking
                            ? 'text-emerald-400'
                            : rp.isMuted
                            ? 'text-slate-500'
                            : 'text-slate-300'
                        }`}
                      >
                        {rp.isSpeaking ? 'Speaking' : rp.isMuted ? 'Mic Muted' : 'Voice Ready'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-1.5 flex-wrap">
                {['चलो साथियों!', 'हम देखेंगे!', 'नो पेपर लीक!'].map((msg) => (
                  <button
                    key={msg}
                    onClick={() => multiplayerClient.sendCallout(msg)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold text-amber-200 cursor-pointer"
                  >
                    Megaphone: "{msg}"
                  </button>
                ))}
              </div>

              <button
                onClick={() => multiplayerClient.requestRoomRaceStart(levelId)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-amber-200 font-extrabold text-xs rounded-lg shadow-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                Start Room Race Countdown!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
