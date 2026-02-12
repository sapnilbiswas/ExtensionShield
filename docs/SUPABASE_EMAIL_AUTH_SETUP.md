# Supabase Email Auth: Why Confirmation Emails Don't Arrive & How to Fix

If you sign up with email and see "Please check your email to confirm your account" but **never receive the email in Gmail** (or any inbox), this guide explains the cause and how to fix it.

---

## Root Cause: Supabase's Default Email Provider

Supabase's **built-in SMTP is for demonstration only** and has strict limits:

| Limitation | Details |
|-----------|---------|
| **Pre-authorized only** | Without custom SMTP, Supabase sends emails **only** to addresses in your [ organization Team ](https://supabase.com/dashboard/org/_/team). Your personal Gmail is not on that list. |
| **Rate limit** | ~2 messages per hour (can change without notice) |
| **Delivery** | No SLA; Gmail often blocks or quarantines emails from `supabase.io` |

**You need custom SMTP** for confirmation emails to reach real users (including your own Gmail).

---

## Fix: Configure Custom SMTP (Resend)

[Resend](https://resend.com) has a free tier and works well with Supabase. Follow these steps:

### 1. Create Resend Account & API Key

1. Go to [resend.com](https://resend.com) and sign up
2. **API Keys** → Create API Key → copy it
3. **Domains** → Add your domain (e.g. `extensionshield.com`) and verify it (add DNS records they provide)

   - For testing without a domain, Resend offers `onboarding@resend.dev` — but Supabase needs a verified sender in most setups. Use your domain when possible.

### 2. Configure SMTP in Supabase

1. [Supabase Dashboard](https://app.supabase.com) → your project → **Authentication** → **Notifications** → **Email**
2. Or go directly to: **Authentication** → **Settings** (or **SMTP Settings** under Email)
3. Enable **Custom SMTP** and enter:

   | Field | Value |
   |-------|-------|
   | **Sender email** | `noreply@yourdomain.com` (or use a Resend test address if available) |
   | **Sender name** | `ExtensionShield` |
   | **Host** | `smtp.resend.com` |
   | **Port** | `465` |
   | **Username** | `resend` |
   | **Password** | Your Resend API key |

4. Save.

After this, Supabase sends all auth emails (confirm signup, password reset, etc.) through Resend, and they should reach Gmail.

---

## Verify Supabase Auth Settings

### URL Configuration (Redirect URLs)

The confirmation link in the email must redirect to a URL that Supabase allows. Add your app URLs:

1. **Authentication** → **URL Configuration**
2. **Site URL:** Your main app URL (e.g. `https://extensionshield.com` or `http://localhost:5173` for local dev)
3. **Redirect URLs:** Add:
   - `https://extensionshield.com/**`
   - `http://localhost:5173/**` (for local dev)
   - Any specific paths you use (e.g. `/auth/callback`)

If the redirect URL used by your app is not in this list, the confirmation link may fail.

### Enable Email Provider

1. **Authentication** → **Providers** → **Email**
2. Ensure **Enable Email provider** is ON
3. **Confirm email** can be ON (recommended) or OFF

---

## Quick Checklist

| Step | Where | Action |
|------|--------|--------|
| 1 | Resend | Create account, verify domain, get API key |
| 2 | Supabase | Auth → Email → Custom SMTP → Resend credentials |
| 3 | Supabase | Auth → URL Configuration → Add Site URL + Redirect URLs |
| 4 | Supabase | Auth → Providers → Email → Ensure enabled |

---

## Auth Logs (Debugging)

If emails still don't arrive after custom SMTP:

1. **Supabase** → **Logs** → **Auth Logs**
2. Look for errors when the confirmation email is handed off to SMTP (e.g. wrong credentials, TLS issues)

Once handed to the SMTP provider, Supabase has no control over delivery. Check Resend's dashboard for delivery status and bounces.

---

## Optional: Disable Email Confirmation (Dev Only)

For quick local testing **only** (not for production):

1. **Authentication** → **Providers** → **Email**
2. Turn **OFF** "Confirm email"

Users can sign in immediately after sign-up without confirming. **Do not use this in production** — it weakens security.

---

## References

- [Supabase: Not receiving auth emails](https://supabase.com/docs/guides/troubleshooting/not-receiving-auth-emails-from-the-supabase-project)
- [Supabase: Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Resend + Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp)
