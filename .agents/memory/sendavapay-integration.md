---
name: SendavaPay integration
description: SendavaPay payin (deposit) integration — pure-push SDK, no redirect, how it works, key files.
---

# SendavaPay Payin Integration

## Architecture
SDK v3 is `pure-api | no-widget | no-iframe | no-redirect | merchant-controls-frontend`.
There is **no redirect URL ever**. It is a pure push flow: the API sends a USSD/push prompt directly to the user's phone.

## Flow
1. **Backend creates payment** (`POST /api/sendavapay/create`) — calls `POST /api/sdk/v1/create-payment` with SDK Bearer key, stores deposit with `status: "processing"` + `sendavapayReference`, returns `{ depositId, paymentToken, reference }`.
2. **Backend initiates payment** (`POST /api/sendavapay/initiate`) — calls `POST /api/sdk/v1/initiate-payment` **with SDK Bearer key** (required). Uses user's registered phone. Push/USSD prompt sent to user's phone automatically.
3. **OTP flow** (operators where `requiresOtp: true`): if response has `requiresOtp: true + otpToken`, frontend shows OTP input → `POST /api/sendavapay/submit-otp` (also requires SDK Bearer key).
4. **No-OTP flow** (most operators like T-Money, Moov): response is `{ success: true }` → go directly to waiting screen.
5. **Status polling** — frontend polls `GET /api/deposits/:id/sendavapay-status` every 5s → calls `POST /api/sdk/v1/verify-payment`. Auto-credits user balance on completion.
6. **Webhook** — `POST /api/webhooks/sendavapay` with HMAC-SHA256 signature verification (header: `x-sendavapay-signature`).

## Key files
- `server/sendavapay.ts` — all API calls (createPayment, initiatePayment, submitOtp, verifyPayment, verifyWebhookSignature, formatPhone, getCurrency, toSendavapayCountry)
- `client/src/pages/deposit.tsx` — deposit UI steps: amount → select → sv-operator → sv-waiting | sv-otp
- `client/src/components/admin/settings.tsx` — admin toggle: sendavapayEnabled, sendavapayChannelName, sendavapayWebhookSecret
- `shared/schema.ts` — deposits table has `sendavapayReference` and `sendavapayToken` columns
- `server/storage.ts` — `getDepositBySendavapayReference(reference)` method

## Auth requirements
- `createPayment`: needs SDK Bearer key ✓
- `initiatePayment`: needs SDK Bearer key ✓ (was missing before — caused failures)
- `submitOtp`: needs SDK Bearer key ✓ (was missing before)
- `verifyPayment`: needs SDK Bearer key ✓

## Activation (admin must do)
1. Set env var `SENDAVAPAY_API_KEY` = SDK key
2. Admin panel → Settings → SendavaPay: enable toggle + optionally set webhook secret
3. In SendavaPay dashboard: configure webhook URL to `<baseUrl>/api/webhooks/sendavapay`

## Country code mapping
App uses CD/CG; SendavaPay uses COD/COG. `toSendavapayCountry()` handles the mapping.

**Why:** The initiate and submit-otp endpoints both require the SDK API key. Previous integration omitted the Authorization header on those two calls, causing UNAUTHORIZED errors. Redirect flow was also incorrectly implemented — the SDK never returns a redirectUrl.
