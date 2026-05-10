# Firestore Security Specification

## Data Invariants
1. A **User** profile can only be created by the authenticated user with the matching UID.
2. **Posts**, **Stories**, and **Comments** must store the `authorUid` or `userUid` that matches the `request.auth.uid`.
3. **Reactions** are unique per user per post/comment.
4. **Earning Activity** and **Withdrawals** must be strictly owned by the user who generated/requested them.
5. **Admin** settings can only be modified by users with the 'admin' role, verified against a trusted document.
6. **Social Videos** can only be deleted by the author or an admin.
7. **PII Isolation**: Phone numbers and emails are only readable by the owner or an admin.

## The Dirty Dozen (Vulnerability Test Payloads)

1. **Identity Spoofing**: Attempt to create a post with `authorUid: "attacker_id"` while authenticated as `user_123`.
2. **Shadow Field Injection**: Attempt to update a user profile with `{ "role": "admin" }`.
3. **Ghost Field Update**: Attempt to update a post with `{ "reactionsCount": 9999 }` without a valid increment action.
4. **PII Scraping**: Attempt to `get` or `list` users as an authenticated user to extract phone numbers.
5. **Referral Fraud**: Attempt to create a referral with `status: 'completed'` to bypass verification.
6. **Balance Poisoning**: Attempt to update `user_balances` directly to increase `currentBalance`.
7. **ID Poisoning**: Attempt to create a document with a 2KB junk string as the ID.
8. **Temporal Fraud**: Attempt to set `createdAt` to a future date instead of `request.time`.
9. **Role Escalation**: Attempt to set `isAdmin: true` in the user document.
10. **State Shortcutting**: Attempt to move a withdrawal from `pending` to `approved` as a standard user.
11. **Cross-User Deletion**: Attempt to delete another user's post.
12. **Recursive Cost Attack**: Attempt to perform a `list` query that forces massive lookups.

## Test Runner (firestore.rules.test.ts)
(To be implemented with Firebase Emulator Suite or equivalent if environment supports it)
