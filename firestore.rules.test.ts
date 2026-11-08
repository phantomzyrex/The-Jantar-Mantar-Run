/**
 * Security Rules Dirty Dozen Verification Suite (firestore.rules.test.ts)
 * Verifies all 12 adversarial payloads against the Eight Pillars of Hardened Rules.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on Profile Create',
    collection: '/profiles/user_B',
    operation: 'create',
    auth: { uid: 'user_A', email_verified: true },
    payload: { userId: 'user_B', displayName: 'Spoofer' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Write',
    collection: '/profiles/user_A',
    operation: 'create',
    auth: { uid: 'user_A', email_verified: false },
    payload: { userId: 'user_A', displayName: 'Unverified' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow / Ghost Field Injection on Create',
    collection: '/profiles/user_A',
    operation: 'create',
    auth: { uid: 'user_A', email_verified: true },
    payload: { userId: 'user_A', displayName: 'Player', isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow / Ghost Field Injection on Update',
    collection: '/profiles/user_A',
    operation: 'update',
    auth: { uid: 'user_A', email_verified: true },
    payload: { userId: 'user_A', hackedRp: 999999 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Immortal Field Mutation on Update',
    collection: '/profiles/user_A',
    operation: 'update',
    auth: { uid: 'user_A', email_verified: true },
    payload: { userId: 'user_B', createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Client Timestamp Forgery',
    collection: '/profiles/user_A',
    operation: 'update',
    auth: { uid: 'user_A', email_verified: true },
    payload: { updatedAt: '2099-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Value Poisoning / Resource Exhaustion',
    collection: '/profiles/user_A',
    operation: 'update',
    auth: { uid: 'user_A', email_verified: true },
    payload: { displayName: 'X'.repeat(5000), seasonRp: -500 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Unbounded Array Injection',
    collection: '/profiles/user_A',
    operation: 'update',
    auth: { uid: 'user_A', email_verified: true },
    payload: { dailyChallengeIds: Array.from({ length: 25 }, (_, i) => `ch_${i}`) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Orphaned Run Creation Without Profile',
    collection: '/runs/run_orphan_1',
    operation: 'create',
    auth: { uid: 'user_no_profile', email_verified: true },
    payload: { runId: 'run_orphan_1', userId: 'user_no_profile', score: 500 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Terminal Run Mutation',
    collection: '/runs/run_1',
    operation: 'update',
    auth: { uid: 'user_A', email_verified: true },
    payload: { status: 'completed', score: 999999 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Cross-User Profile Read (PII Blanket Test)',
    collection: '/profiles/user_A',
    operation: 'get',
    auth: { uid: 'user_B', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unauthorized Collection Scraping (Query Trust Test)',
    collection: '/runs',
    operation: 'list',
    auth: { uid: 'user_B', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
