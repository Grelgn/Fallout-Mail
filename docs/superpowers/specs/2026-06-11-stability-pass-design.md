# Stability pass — design

2026-06-11. Covers both repos: Fallout-Mail (frontend) and Fallout-Mail-Backend.
Scope: items 1–13 from the session review — every known crash, silent failure,
the sender-spoofing hole, inbox refresh, power-on splash, and small polish.

## Backend (Fallout-Mail-Backend)

### Session auth
- `app.set("trust proxy", 1)` — app runs behind Coolify's proxy; required for secure cookies.
- CORS: `origin: [https://fallout-mail.31.97.179.20.sslip.io, http://localhost:5173]`,
  `credentials: true`. No more wildcard.
- Session cookie: `sameSite: "none"`, `secure: true`, `maxAge` 7 days (unchanged).
  `sameSite: "none"` is what makes the cross-subdomain sslip.io split work; tighten to
  `lax` if both apps later share a custom domain.
- `PrismaSessionStore` reuses the shared `prismaClient.js` instance instead of
  constructing a second `PrismaClient`.
- Auth middleware: `req.isAuthenticated()` or `401 {success: false, message: "Not logged in"}`.

### Routes
| Route | Change |
|---|---|
| `POST /sign-up` | Rewritten error handling: `await bcrypt.hash` (callback escaped the async error handler), duplicate username → `400 {success:false, message:"User already exists"}`, other errors → `500` with a real body (previously: hang). Password min length 8. |
| `POST /log-in` | Unchanged behavior; the cookie it sets is now actually used. |
| `POST /log-out` | New. Destroys the session, returns `{success: true}`. |
| `GET /messages` | New, auth-required. Returns `messagesReceived`/`messagesSent` with sender/receiver usernames — same shape as the login payload. |
| `POST /message` | Auth-required. Sender comes from `req.user.id`, never the request body. `receiver` becomes a declared `const` with an explicit not-found check. |

### Hygiene
- `package.json`: add `"start": "node app.js"`, fix `"main"`.

## Frontend (Fallout-Mail)

### Fetch helper — `src/api.js`
Single `apiFetch(path, options)` used by all components: prepends `VITE_API_URL`,
sets JSON headers, `credentials: "include"`, and converts network/parse failures into
`{success: false, message: "Connection to ROBCO mainframe lost"}`. Components print
`json.message` to the terminal line and never throw.

### Crash fixes
- All `document.querySelector(".selected").classList.remove(...)` call sites get
  null-guards (`?.`): LogIn, SignUp, Inbox, Sent, UserList.
- Message.jsx: missing message no longer dereferences `message.title`.
- Error boundary wrapping `<App/>` (new `src/components/SystemFailure.jsx` or similar):
  render crash → terminal-styled "SYSTEM FAILURE" screen with `[Reboot terminal]`
  (reloads page) instead of a black screen.

### Inbox refresh
Navigating to Inbox or Sent fetches `GET /messages` first, merges into user state, then
opens the page. The client-side `messagesSent.push()` after sending is removed — Sent is
fresh on every visit. Logout calls `POST /log-out` (tolerating failure), then clears
client state as before.

### Power-on splash
App starts powered off: black screen, blinking `CLICK TO POWER ON`. First click or
keypress: request fullscreen, create/resume the AudioContext, start the fan hum, boot the
terminal (print animation runs with sound — it's all after a real user gesture, so no
autoplay warnings). Implementation: `poweredOn` state gating the terminal render;
the line-printing effect gains `poweredOn` in deps and returns early when off. The old
`firstEnter`/`forceFullscreen`-on-first-menu-click is removed.

### Polish
- Empty Inbox/Sent render a printed, non-selectable `No messages.` line.
- `[Add page]` button and `addPage()` stub removed (multi-page compose deferred; backend
  caps bodies at 400 chars anyway).
- Debug `console.log`s removed; `console.error`s in genuine failure paths stay.

## Order and verification

1. Backend changes → deploy → curl tests with a cookie jar: sign-up validation, login
   sets cookie, `/messages` 401 without / 200 with, `/message` rejects spoofed sender.
2. Frontend changes → verify in local preview against the live API (login, inbox refresh,
   empty states, splash, failure messages with API down).
3. Deploy frontend → live verification.

Known window: between the two deploys the old frontend can't send mail (no cookie).
Acceptable; the app has two users and both are Grelgn.
