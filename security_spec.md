# Security Specification - EduStream School Manager

## 1. Data Invariants
- A student cannot mark their own attendance.
- Only teachers can upload marks for their assigned classes.
- Admin can manage all users and roles.
- Fees can only be marked as paid by an Admin.
- Announcements are immutable once created (or only editable by Admin).
- `ownerId` (uid) must match the authenticated user's UID on creation.

## 2. The "Dirty Dozen" Payloads (Red Team Test Scenarios)

1. **Identity Spoofing**: A student tries to create a user profile with `role: 'admin'`.
2. **Privilege Escalation**: A teacher tries to update their own role to `admin`.
3. **Orphaned Record**: Creating an assignment for a `classId` that does not exist.
4. **Illegal Attendance**: A student tries to write to the `attendance` collection.
5. **Mark Injection**: A student tries to create a `Result` record for themselves.
6. **Fee Forgery**: A student tries to update their `Fee` record `status` to `'paid'`.
7. **Resource Exhaustion**: Sending a 1MB string in an announcement title.
8. **ID Poisoning**: Using a path variable containing `../../` in a document ID.
9. **Email Spoofing**: A user sets their email to an admin's email but `email_verified` is false.
10. **State Skipping**: Updating an assignment's `teacherId` to someone else.
11. **Future Timestamp**: Setting `createdAt` to a future date instead of `request.time`.
12. **PII Leak**: A student tries to list all user profiles and see private emails of other students.

## 3. The Test Runner Plan
Test file `firestore.rules.test.ts` will verify that all above payloads return `PERMISSION_DENIED`.
Since I cannot run a full test runner in this environment easily without setting up a test environment, I will focus on perfect rules first and follow the manual audit.
