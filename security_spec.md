# Security Specifications & Rules Design

## 1. Data Invariants
- Products: Only authenticated managers or admins can modify product catalog documents. Read operations are public/authenticated.
- Orders: Orders can be created by authenticated users or guests (with valid customer details). Customers can read their own orders. Admins can read/update all orders.
- Users: Users can read and update their own user profile document (`/users/{userId}`). Admins have read/write access.
- Audit Logs: Audit logs are append-only by authenticated users and readable by Admins.
- System Catch-all: All unlisted paths are default-denied.

## 2. Dirty Dozen Security Payloads
1. Unauthorized Role Elevation: Non-admin user setting `role: "Super Admin"` on user profile.
2. Cross-User Data Access: User A requesting order document owned by User B.
3. System ID Exhaustion: Submitting document path ID with 2KB string length.
4. Schema Injection (Ghost Fields): Injecting `isVerifiedAdmin: true` into a Product creation payload.
5. Unverified Email Bypass: Unverified email address trying to execute administrative updates.
6. Negative Price Injection: Creating product with `sellingPrice: -500`.
7. Price Tampering on Order: Updating `total: 0` on an active order.
8. Unbounded Array Injection: Injecting 10,000 array elements into tags field.
9. Impersonation Attack: Setting `customerId` to target victim's UID.
10. Unauthenticated Log Erasure: Attempting to delete audit log entry.
11. Status Machine Bypass: Updating completed order status directly to refunded without admin privileges.
12. Direct System Collections Mutation: Modifying global settings without authorization.
