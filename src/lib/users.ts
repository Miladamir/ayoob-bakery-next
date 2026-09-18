import User from "@/models/User";

/* (escapeRegex lives in lib/admin.ts, which imports lib/auth.ts —
    importing it here would create a cycle, so it's inlined.) */
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ============================================================
   PHASE 8: CASE-INSENSITIVE USER LOOKUP

   Emails are case-insensitive in practice, but MongoDB string
   matching is not — Foo@x.com and foo@x.com were two different
   accounts (the unique index allowed both, and a mixed-case
   registrant couldn't sign in with lowercase).

   Every account saved from Phase 8 onward stores lowercase, so the
   exact match hits the email index. The regex fallback exists
   permanently for any legacy mixed-case accounts — no data
   migration required. (Optional cleanup script is in the phase
   notes.)
============================================================ */
export async function findUserByEmail(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();

  /* fast path — index-backed exact match */
  const user = await User.findOne({ email });
  if (user) return user;

  /* legacy accounts stored with mixed-case emails */
  return User.findOne({
    email: new RegExp(`^${escapeRegex(email)}$`, "i"),
  });
}