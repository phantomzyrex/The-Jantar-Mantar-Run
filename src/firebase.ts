import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { calculateRankTier, ProtesterId, RankTier } from './types/game';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot as required by firebase-integration-rpc skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Blueprint validation constants (mirrored verbatim from firebase-blueprint.json)
const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const VALID_PROTESTERS: ProtesterId[] = ['neha', 'abhijit', 'nsui', 'genz', 'minister', 'warrior'];
const VALID_RANKS: RankTier[] = [
  'Morcha Rookie',
  'Sadak Runner',
  'Barricade Breaker',
  'Inquilab Leader',
  'Jantar Mantar Legend',
];

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  return cleaned.length > 0 ? cleaned : 'user_default';
}

function sanitizeDisplayName(raw: string): string {
  const trimmed = (raw || 'Delhi Protester').trim().slice(0, 40);
  return trimmed.length > 0 ? trimmed : 'Delhi Protester';
}

export interface PlayerProfileDoc {
  userId: string;
  displayName: string;
  protesterId: ProtesterId;
  seasonRp: number;
  rankTier: RankTier;
  bestScore: number;
  bestTimeMs: number;
  totalRuns: number;
  dailyChallengeIds: string[];
}

export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged };
export type { User };

export async function loadOrCreatePlayerProfile(user: User): Promise<PlayerProfileDoc> {
  const uid = sanitizeId(user.uid);
  const profilePath = `profiles/${uid}`;
  const profileRef = doc(db, 'profiles', uid);

  let snap;
  try {
    snap = await getDoc(profileRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, profilePath);
  }

  if (snap && snap.exists()) {
    const data = snap.data();
    return {
      userId: uid,
      displayName: sanitizeDisplayName(data.displayName || user.displayName || 'Protester'),
      protesterId: VALID_PROTESTERS.includes(data.protesterId) ? data.protesterId : 'genz',
      seasonRp: Number(data.seasonRp) || 0,
      rankTier: VALID_RANKS.includes(data.rankTier) ? data.rankTier : 'Morcha Rookie',
      bestScore: Number(data.bestScore) || 0,
      bestTimeMs: Number(data.bestTimeMs) || 0,
      totalRuns: Number(data.totalRuns) || 0,
      dailyChallengeIds: Array.isArray(data.dailyChallengeIds)
        ? data.dailyChallengeIds.slice(0, 10).map((s: unknown) => String(s).slice(0, 40))
        : [],
    };
  }

  const initialProfile: PlayerProfileDoc = {
    userId: uid,
    displayName: sanitizeDisplayName(user.displayName || 'Morcha Runner'),
    protesterId: 'genz',
    seasonRp: 100,
    rankTier: 'Morcha Rookie',
    bestScore: 0,
    bestTimeMs: 0,
    totalRuns: 0,
    dailyChallengeIds: [],
  };

  if (user.emailVerified) {
    try {
      await setDoc(profileRef, {
        ...initialProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, profilePath);
    }
  }

  return initialProfile;
}

export async function saveCompletedRunAndProfile(params: {
  user: User | null;
  currentProfile: PlayerProfileDoc;
  protesterId: ProtesterId;
  levelId: string;
  score: number;
  timeMs: number;
  distanceM: number;
  status: 'completed' | 'arrested';
  earnedRp: number;
  newlyCompletedChallenges: string[];
}): Promise<PlayerProfileDoc> {
  const {
    user,
    currentProfile,
    protesterId,
    levelId,
    score,
    timeMs,
    distanceM,
    status,
    earnedRp,
    newlyCompletedChallenges,
  } = params;

  const safeScore = Math.max(0, Math.min(1000000, Math.round(score)));
  const safeTimeMs = Math.max(1000, Math.min(3600000, Math.round(timeMs)));
  const safeDistanceM = Math.max(0, Math.min(50000, Math.round(distanceM)));
  const mergedChallenges = Array.from(
    new Set([...currentProfile.dailyChallengeIds, ...newlyCompletedChallenges])
  )
    .slice(0, 10)
    .map((id) => String(id).slice(0, 40));

  const newSeasonRp = Math.max(
    0,
    Math.min(1000000, Math.round(currentProfile.seasonRp + earnedRp))
  );
  const newRankTier = calculateRankTier(newSeasonRp);
  const newBestScore = Math.max(currentProfile.bestScore, safeScore);
  const newBestTimeMs =
    status === 'completed'
      ? currentProfile.bestTimeMs === 0
        ? safeTimeMs
        : Math.min(currentProfile.bestTimeMs, safeTimeMs)
      : currentProfile.bestTimeMs;

  const updatedProfile: PlayerProfileDoc = {
    userId: currentProfile.userId,
    displayName: sanitizeDisplayName(currentProfile.displayName),
    protesterId: VALID_PROTESTERS.includes(protesterId) ? protesterId : 'genz',
    seasonRp: newSeasonRp,
    rankTier: newRankTier,
    bestScore: newBestScore,
    bestTimeMs: newBestTimeMs,
    totalRuns: Math.min(100000, currentProfile.totalRuns + 1),
    dailyChallengeIds: mergedChallenges,
  };

  if (user && user.emailVerified && ID_REGEX.test(user.uid)) {
    const uid = sanitizeId(user.uid);
    const profilePath = `profiles/${uid}`;
    const profileRef = doc(db, 'profiles', uid);

    try {
      await updateDoc(profileRef, {
        displayName: updatedProfile.displayName,
        protesterId: updatedProfile.protesterId,
        seasonRp: updatedProfile.seasonRp,
        rankTier: updatedProfile.rankTier,
        bestScore: updatedProfile.bestScore,
        bestTimeMs: updatedProfile.bestTimeMs,
        totalRuns: updatedProfile.totalRuns,
        dailyChallengeIds: updatedProfile.dailyChallengeIds,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, profilePath);
    }

    const rawRunId = `run_${uid.slice(0, 16)}_${Date.now()}`;
    const runId = sanitizeId(rawRunId);
    const runPath = `runs/${runId}`;
    const runRef = doc(db, 'runs', runId);
    const safeLevelId = levelId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40) || 'sansad_marg';

    try {
      await setDoc(runRef, {
        runId,
        userId: uid,
        displayName: updatedProfile.displayName,
        protesterId: updatedProfile.protesterId,
        levelId: safeLevelId,
        score: safeScore,
        timeMs: safeTimeMs,
        distanceM: safeDistanceM,
        status,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, runPath);
    }
  }

  // Also sync to global server leaderboard
  try {
    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: updatedProfile.userId,
        displayName: updatedProfile.displayName,
        protesterId: updatedProfile.protesterId,
        levelId,
        score: safeScore,
        timeMs: safeTimeMs,
        seasonRp: updatedProfile.seasonRp,
        rankTier: updatedProfile.rankTier,
      }),
    });
  } catch {
    // Non-fatal if offline
  }

  return updatedProfile;
}
