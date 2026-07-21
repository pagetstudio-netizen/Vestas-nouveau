---
name: SendavaPay integration
description: SendavaPay payin (deposit) integration — how it works, key files, and activation steps.
---

# SendavaPay Payin Integration

## How it works
1. **Backend creates payment** (`POST /api/sendavapay/create`) — calls `POST /api/sdk/v1/create-payment` with SDK key, stores deposit with `status: "processing"` + `sendavapayReference`, returns `{ depositId, paymentToken, reference }`.
2. **Backend initiates payment** (`POST /api/sendavapay/initiate`) — proxies `POST /api/sdk/v1/initiate-payment` (CORS endpoint, no SDK key needed). Uses user's registered phone automatically (no manual phone entry).
3. **OTP flow** (Orange Money BF/CI/GN/ML/SN): if `requiresOtp: true`, frontend shows OTP input → `POST /api/sendavapay/submit-otp`.
4. **Redirect flow** (Wave etc.): if `requiresRedirect: true`, open `redirectUrl` in browser.
5. **Status polling** — frontend polls `GET /api/deposits/:id/sendavapay-status` every 5s → calls `POST /api/sdk/v1/verify-payment`. Auto-credits user balance on completion.
6. **Webhook** — `POST /api/webhooks/sendavapay` with HMAC-SHA256 signature verification.

## Key files
- `server/sendavapay.ts` — all API calls (createPayment, initiatePayment, submitOtp, verifyPayment, verifyWebhookSignature, formatPhone, getCurrency, toSendavapayCountry)
- `client/src/pages/deposit.tsx` — full deposit UI with SendavaPay flow (steps: amount → select → sv-operator → sv-waiting/sv-otp/sv-redirect)
- `client/src/components/admin/settings.tsx` — admin toggle: sendavapayEnabled, sendavapayChannelName, sendavapayWebhookSecret
- `shared/schema.ts` — deposits table has `sendavapayReference` and `sendavapayToken` columns
- `server/storage.ts` — `getDepositBySendavapayReference(reference)` method added

## Activation (admin must do)
1. Set env var `SENDAVAPAY_API_KEY` = SDK key (starts with `sdk_`)
2. Admin panel → Settings → SendavaPay: enable toggle + optionally set webhook secret
3. In SendavaPay dashboard: configure webhook URL to `<baseUrl>/api/webhooks/sendavapay`

## Country code mapping
App uses CD/CG; SendavaPay uses COD/COG. `toSendavapayCountry()` handles the mapping.

**Why:** SendavaPay CORS initiate endpoint is proxied through backend for security and to update deposit status on initiation.
