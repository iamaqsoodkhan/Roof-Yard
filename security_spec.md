# Security Specification — Roof Yard Firestore Rules

## 1. Data Invariants
1. A `UserProfile` document at `/users/{userId}` can only be read, created, or updated by the authenticated, email-verified user whose `request.auth.uid == userId`, or by a verified admin.
2. `UserProfile` documents cannot contain privilege/role fields (`role`, `isAdmin`) and `uid` and `createdAt` remain immutable after creation.
3. An `Order` document at `/orders/{orderId}` can only be created by an authenticated, email-verified user where `incoming().userId == request.auth.uid`, initial `status == 'confirmed'`, and `createdAt == request.time`.
4. `Order` documents are strictly isolated on `get` and `list`: only the owning user (`resource.data.userId == request.auth.uid`) or a verified admin may read or query them.
5. Once an `Order` reaches the terminal status `'delivered'`, non-admin updates are strictly rejected.
6. All timestamps (`createdAt`, `updatedAt`) are server-verified via `request.time`.

## 2. Dirty Dozen Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated User Read**: `GET /users/user123` with `auth = null`.
2. **Cross-User PII Read**: `GET /users/victimUid` signed in as `attackerUid`.
3. **Self-Assigned Admin Escalation**: `CREATE /users/attackerUid` containing extra ghost field `isAdmin: true` or `role: "admin"`.
4. **UID Spoofing on Order Create**: `CREATE /orders/ord1` with `userId: "victimUid"` while signed in as `attackerUid`.
5. **Unverified Email Write**: `CREATE /orders/ord1` with `request.auth.token.email_verified == false`.
6. **Status Shortcutting on Create**: `CREATE /orders/ord1` with `status: "delivered"` instead of `"confirmed"`.
7. **Timestamp Forgery**: `CREATE /orders/ord1` with client-supplied past/future `createdAt` != `request.time`.
8. **Shadow Field Injection on Update**: `UPDATE /orders/ord1` with `affectedKeys` including `total: 1` or `isPaid: true`.
9. **Terminal State Mutation**: `UPDATE /orders/ord1` (where `existing().status == "delivered"`) attempting to revert `status` to `"cooking"`.
10. **Blanket Order List Scraping**: `LIST /orders` without `where("userId", "==", auth.uid)`.
11. **Path ID Poisoning**: `CREATE /orders/invalid$id!with*badchars` (fails `isValidId`).
12. **Resource Exhaustion (1MB String)**: `CREATE /orders/ord2` with `notes` > 400 chars or `items` > 40 entries.
