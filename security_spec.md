# Security Specification (Phase 0 — Payload-First TDD)

## 1. Data Invariants
1. **Storefront CMS (`/cms/public`)**: Only `docId == 'public'` may exist or be read publicly (`get` only, never `list`, never `delete`). Only verified studio admins (`isAdmin()`) may create or update `/cms/public`, and `updatedAt` MUST equal `request.time`. Array sizes are bounded (`projects <= 100`, `services <= 30`, `processSteps <= 20`, `craftDetails <= 30`, `comparisonCases <= 20`).
2. **Media Manifest (`/media_index/all`)**: Only verified studio admins (`isAdmin()`) may `get`, `create`, or `update` `/media_index/all`. Never readable or listable publicly.
3. **Compressed Studio Media (`/media/{mediaId}`)**: Only verified studio admins (`isAdmin()`) may create or delete media documents, with `uploaderUid == request.auth.uid`, `createdAt == request.time`, `dataUrl.size() <= 750000`, and `thumbUrl.size() <= 180000`. Public visitors may `get` an individual media asset by valid ID (`isValidId(mediaId)`) when referenced by a published slot, with `list` disabled.
4. **Client Enquiries (`/enquiries/{enquiryId}`)**: Contains PII (`name`, `phone`, `email`, `location`, `brief`). Any visitor may `create` an enquiry ONLY with `status == 'new'`, `internalNote == ''`, `studioTarget == 'spaces_by_muskan'`, `createdAt == request.time`, and strict field bounds (`hasOnly`). Public/non-admin users can NEVER `get`, `list`, `update`, or `delete` enquiries. Verified studio admins can read, update `status`/`internalNote` (keeping `createdAt` and contact fields immutable), or delete enquiries.
5. **Admins (`/admins/{uid}`)**: Users may only `get` their own UID doc (`request.auth.uid == uid`) or admins may inspect it; client writes are completely blocked (`false`) to prevent privilege escalation.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. Unauthenticated `update` on `/cms/public` -> DENIED (`isAdmin()` fails).
2. Unverified-email admin spoof (`email: 'adityaagarwal113@gmail.com'`, `email_verified: false`) writing `/cms/public` -> DENIED (`email_verified == true` check fails).
3. Ghost field injection on `/cms/public` (`{ ..., isHacked: true }`) -> DENIED (`hasOnly` check fails).
4. Client timestamp forgery on `/cms/public` (`updatedAt: "2020-01-01T00:00:00Z"` instead of `request.time`) -> DENIED.
5. Unauthenticated `get` or `list` on `/enquiries/{id}` (PII scrape attempt) -> DENIED.
6. Public `create` on `/enquiries/{id}` attempting pre-approved status (`status: 'completed'`) -> DENIED (`status == 'new'` invariant fails).
7. Public `create` on `/enquiries/{id}` injecting shadow field (`adminBypass: true`) -> DENIED (`hasOnly` fails).
8. Public `create` on `/enquiries/{id}` with 10 KB `name` string (Resource/DoW poisoning) -> DENIED (`name.size() <= 120` fails).
9. Admin `update` on `/enquiries/{id}` attempting to alter `createdAt` or `phone` -> DENIED (`affectedKeys().hasOnly(['status', 'internalNote'])` and `incoming().createdAt == existing().createdAt` fails).
10. Unauthenticated `create` or `delete` on `/media/{mediaId}` -> DENIED.
11. Oversized image poisoning on `/media/{mediaId}` (`dataUrl.size() > 750000`) -> DENIED.
12. Authenticated non-admin attempting self-privilege escalation via `setDoc` on `/admins/{uid}` (`{ role: 'admin' }`) -> DENIED (`allow create, update: if false`).
