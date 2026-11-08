# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Zero-Trust Default Deny**: Every path not explicitly matched under `/profiles/{userId}` or `/runs/{runId}` is unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity & Ownership**:
   - All write operations (`create`, `update`) require `request.auth != null` and `request.auth.token.email_verified == true`.
   - A `PlayerProfile` at `/profiles/{userId}` can only be read, created, or updated when `request.auth.uid == userId` and `incoming().userId == request.auth.uid`.
   - A `RaceRun` at `/runs/{runId}` can only be created when `incoming().userId == request.auth.uid` and the parent profile `/profiles/$(incoming().userId)` already exists (`exists(...)`).
3. **Path Variable & Payload Size Hardening (Denial of Wallet Guard)**:
   - Document IDs (`userId`, `runId`) on single-document operations (`get`, `create`, `update`, `delete`) must satisfy `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
   - Every string field enforces strict `.size()` bounds matching `firebase-blueprint.json`.
   - `dailyChallengeIds` is a bounded list (`size() <= 10`) with element type validation when non-empty.
4. **Anti-Update-Gap & Immutable Fields**:
   - `isValidPlayerProfile(incoming())` wraps all profile creations and updates.
   - Profile updates enforce `incoming().userId == existing().userId`, `incoming().createdAt == existing().createdAt`, `incoming().updatedAt == request.time`, and `incoming().diff(existing()).affectedKeys().hasOnly(...)`.
   - `RaceRun` documents are terminal upon creation (`allow update, delete: if false;`).
5. **Secure List Queries**:
   - `/profiles/{userId}` disables `list` (`allow list: if false;`).
   - `/runs/{runId}` restricts `list` strictly to the owner via `resource.data.userId == request.auth.uid`.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Identity Spoofing on Profile Create)**: Authenticated user `user_A` attempts to create `/profiles/user_B` or sets `userId: "user_B"`. -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Write)**: User `user_A` with `email_verified: false` attempts to create `/profiles/user_A`. -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow / Ghost Field Injection on Create)**: User `user_A` creates `/profiles/user_A` including an undeclared field `"isAdmin": true`. -> `PERMISSION_DENIED`
4. **Payload 4 (Shadow / Ghost Field Injection on Update)**: User `user_A` updates `/profiles/user_A` with an undeclared field `"hackedRp": 999999`. -> `PERMISSION_DENIED`
5. **Payload 5 (Immortal Field Mutation on Update)**: User `user_A` attempts to modify `createdAt` or `userId` on `/profiles/user_A`. -> `PERMISSION_DENIED`
6. **Payload 6 (Client Timestamp Forgery)**: User `user_A` submits a past or future timestamp instead of `request.time` for `createdAt` or `updatedAt`. -> `PERMISSION_DENIED`
7. **Payload 7 (Value Poisoning / Resource Exhaustion)**: User `user_A` sends a 5,000-character `displayName` or `seasonRp: "not-a-number"` or negative `seasonRp: -50`. -> `PERMISSION_DENIED`
8. **Payload 8 (Unbounded Array Injection)**: User `user_A` sends `dailyChallengeIds` with 25 items (exceeding max 10) or non-string first element `[12345]`. -> `PERMISSION_DENIED`
9. **Payload 9 (Orphaned Run Creation)**: User `user_A` attempts to create `/runs/run_1` when `/profiles/user_A` does not exist in Firestore. -> `PERMISSION_DENIED`
10. **Payload 10 (Terminal Run Mutation)**: User `user_A` attempts to update `/runs/run_1` to change `score` or `status` from `'arrested'` to `'completed'`. -> `PERMISSION_DENIED`
11. **Payload 11 (Cross-User Profile Read / PII Blanket Test)**: User `user_B` attempts `get` on `/profiles/user_A`. -> `PERMISSION_DENIED`
12. **Payload 12 (Unauthorized Collection Scraping / Query Trust Test)**: User `user_B` attempts an unfiltered `list` query on `/runs` without filtering `userId == user_B`. -> `PERMISSION_DENIED`
