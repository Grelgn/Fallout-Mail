# Stability Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every known crash and silent failure, wire real session auth (no more sender spoofing), add inbox refresh, a power-on splash, and small polish — items 1–13 from the session review.

**Architecture:** Backend gains cookie-session auth (already half-built with passport + Prisma session store) with two new routes (`POST /log-out`, `GET /messages`) and locked-down CORS. Frontend routes all API calls through one `apiFetch` helper (credentials + connection-failure messages), gets an error boundary, a `poweredOn` splash gate, and per-component crash guards.

**Tech Stack:** React 18 + Vite (frontend), Express 4 + Prisma 6 + Postgres + passport (backend), deployed on Coolify via its REST API.

**Spec:** `docs/superpowers/specs/2026-06-11-stability-pass-design.md`

**Verification approach:** Neither repo has a test framework and adding one is out of scope. Backend tasks are verified with PowerShell `Invoke-RestMethod` calls (cookie jar via `-WebSession`) against the deployed API; frontend tasks via the Claude Preview browser against the live API. Each task ends with a verification step that must pass before committing.

**Commit style (mandatory):** single-line messages in Grelgn's voice, sentence case, no type prefixes, no AI attribution. Examples in each task.

**Deploy notes:** Coolify panel `https://panel.creadesign.studio`, token at `C:\Users\Grelgn\Claude\.coolify_token`. Backend app uuid `mowowcocco4g4sw0os4c8w04`, frontend app uuid `bgks0wcccwoog0k04gwk0cwk`. Deploy = `POST /api/v1/deploy?uuid=<uuid>`, poll `GET /api/v1/deployments/<deployment_uuid>` until not `queued`/`in_progress`.

---

## Part A — Backend (`C:\Users\Grelgn\Claude\Fallout-Mail-Backend`)

### Task A1: package.json hygiene

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Fix main and add start script**

In `package.json`, change `"main": "index.js"` to `"main": "app.js"` and replace the scripts block:

```json
  "scripts": {
    "start": "node app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

- [ ] **Step 2: Commit**

```
git add package.json
git commit -m "Add start script"
```

### Task A2: app.js — trust proxy, locked CORS, secure session cookie, shared Prisma client

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Apply the changes**

Remove these two lines (the shared `prisma` from `prismaClient.js` stays):

```js
const { PrismaClient } = require("@prisma/client");
```

and at the bottom:

```js
module.exports = {
	prisma,
};
```

Replace:

```js
const app = express();

app.use(cors());
```

with:

```js
const app = express();

app.set("trust proxy", 1);

app.use(
	cors({
		origin: [
			"https://fallout-mail.31.97.179.20.sslip.io",
			"http://localhost:5173",
		],
		credentials: true,
	})
);
```

Replace the session block:

```js
app.use(
	session({
		cookie: {
			maxAge: 7 * 24 * 60 * 60 * 1000, // ms
			sameSite: "none",
			secure: true,
		},
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
		store: new PrismaSessionStore(prisma, {
			checkPeriod: 2 * 60 * 1000, //ms
			dbRecordIdIsSessionId: true,
			dbRecordIdFunction: undefined,
		}),
	})
);
```

- [ ] **Step 2: Syntax check**

Run: `node --check app.js`
Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```
git add app.js
git commit -m "Restrict cors and secure the session cookie"
```

### Task A3: userController — sign-up error handling, password min length, logout

**Files:**
- Modify: `controllers/userController.js`

- [ ] **Step 1: Replace `userSignUp` and add `userLogOut`**

Replace the whole `userSignUp` array with:

```js
const userSignUp = [
	body("username")
		.trim()
		.notEmpty()
		.withMessage("Username must be specified")
		.isLength({ max: 25 })
		.withMessage("Username can't be more than 25 characters")
		.escape(),
	body("password")
		.trim()
		.notEmpty()
		.withMessage("Password must be specified")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.isLength({ max: 25 })
		.withMessage("Password can't be more than 25 characters")
		.escape(),
	body("confirm")
		.trim()
		.custom((value, { req }) => {
			return value === req.body.password;
		})
		.withMessage("Passwords do not match")
		.escape(),

	asyncHandler(async (req, res, next) => {
		const result = validationResult(req);
		if (result.errors.length > 0) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: result.errors,
			});
		}
		try {
			const hashedPassword = await bcrypt.hash(req.body.password, 10);
			const user = await prisma.user.create({
				data: {
					username: req.body.username,
					password: hashedPassword,
				},
			});
			return res.status(201).json({
				success: true,
				message: "User created successfully",
				userId: user.id,
			});
		} catch (e) {
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === "P2002"
			) {
				return res.status(400).json({
					success: false,
					message: "User already exists",
				});
			}
			return res.status(500).json({
				success: false,
				message: "Error creating user",
			});
		}
	}),
];
```

Add before `module.exports`:

```js
const userLogOut = (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return res
				.status(500)
				.json({ success: false, message: "Error logging out" });
		}
		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			return res.status(200).json({ success: true, message: "Logged out" });
		});
	});
};
```

Update exports:

```js
module.exports = {
	userSignUp,
	userLogIn,
	userLogOut,
};
```

- [ ] **Step 2: Syntax check**

Run: `node --check controllers/userController.js`
Expected: exit 0.

- [ ] **Step 3: Commit**

```
git add controllers/userController.js
git commit -m "Fix sign up error handling and add log out"
```

### Task A4: messageController — sender from session, receiver check, getMessages

**Files:**
- Modify: `controllers/messageController.js`

- [ ] **Step 1: Replace the handler in `sendMessage` and add `getMessages`**

Replace the `asyncHandler(...)` element of the `sendMessage` array (validation chains stay as they are) with:

```js
	asyncHandler(async (req, res, next) => {
		const result = validationResult(req);
		if (result.errors.length > 0) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: result.errors,
			});
		}
		const receiver = await prisma.user.findFirst({
			where: {
				username: req.body.receiver,
			},
			select: {
				id: true,
			},
		});
		if (!receiver) {
			return res.status(400).json({
				success: false,
				message: "User does not exist",
			});
		}
		const message = await prisma.message.create({
			data: {
				senderId: req.user.id,
				receiverId: receiver.id,
				title: req.body.title,
				body: req.body.body,
			},
		});
		return res.status(201).json({
			success: true,
			message: "Message sent",
			data: message,
		});
	}),
```

Add before `module.exports`:

```js
const getMessages = asyncHandler(async (req, res) => {
	const user = await prisma.user.findFirst({
		where: {
			id: req.user.id,
		},
		select: {
			messagesReceived: {
				include: {
					sender: {
						select: {
							username: true,
						},
					},
				},
			},
			messagesSent: {
				include: {
					receiver: {
						select: {
							username: true,
						},
					},
				},
			},
		},
	});
	return res.status(200).json({
		success: true,
		messagesReceived: user.messagesReceived,
		messagesSent: user.messagesSent,
	});
});
```

Update exports:

```js
module.exports = {
	sendMessage,
	getMessages,
};
```

- [ ] **Step 2: Syntax check**

Run: `node --check controllers/messageController.js`
Expected: exit 0.

- [ ] **Step 3: Commit**

```
git add controllers/messageController.js
git commit -m "Take sender from the session and add messages endpoint"
```

### Task A5: Routes and auth middleware

**Files:**
- Modify: `routes/indexRouter.js`

- [ ] **Step 1: Replace the file**

```js
const express = require("express");
const router = express.Router();

//  Require controller modules
const userController = require("../controllers/userController");
const messageController = require("../controllers/messageController");

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) return next();
	return res.status(401).json({ success: false, message: "Not logged in" });
}

router.post("/sign-up", userController.userSignUp);
router.post("/log-in", userController.userLogIn);
router.post("/log-out", userController.userLogOut);
router.get("/messages", isAuthenticated, messageController.getMessages);
router.post("/message", isAuthenticated, messageController.sendMessage);

module.exports = router;
```

- [ ] **Step 2: Syntax check**

Run: `node --check routes/indexRouter.js`
Expected: exit 0.

- [ ] **Step 3: Commit**

```
git add routes/indexRouter.js
git commit -m "Require login for message routes"
```

### Task A6: Push, deploy, verify the live API

- [ ] **Step 1: Push and deploy**

```
git push origin main
```

Then `POST https://panel.creadesign.studio/api/v1/deploy?uuid=mowowcocco4g4sw0os4c8w04` (Bearer token) and poll the returned deployment uuid until `finished`.

- [ ] **Step 2: Verify with a cookie jar** (PowerShell; `$api = "https://fallout-mail-api.31.97.179.20.sslip.io"`)

1. Short password rejected:
   `POST $api/sign-up` body `{username:"x", password:"short", confirm:"short"}` → 400, first error msg "Password must be at least 8 characters".
2. Login sets a session:
   `Invoke-RestMethod -Uri "$api/log-in" -Method Post -SessionVariable s -Body (@{username="vault_dweller"; password="GaryGaryGary1!"}|ConvertTo-Json) -ContentType 'application/json'` → `success: true`.
3. `GET $api/messages` **without** `-WebSession` → 401 `Not logged in`.
4. `GET $api/messages -WebSession $s` → 200, `messagesReceived` array present.
5. Spoof attempt: `POST $api/message -WebSession $s` body `{sender:"<Grelgn's uuid>", receiver:"Grelgn", title:"spoof test", body:"hello"}` → 201 and returned `data.senderId` equals **vault_dweller's** id, not the body value.
6. `POST $api/message` without session → 401.
7. `POST $api/log-out -WebSession $s` → success, then `GET $api/messages -WebSession $s` → 401.

All seven must pass before starting Part B.

---

## Part B — Frontend (`C:\Users\Grelgn\Claude\Fallout-Mail`)

### Task B1: apiFetch helper

**Files:**
- Create: `src/api.js`

- [ ] **Step 1: Create the file**

```js
const API_URL = import.meta.env.VITE_API_URL;

async function apiFetch(path, options = {}) {
	try {
		const response = await fetch(API_URL + path, {
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			...options,
		});
		return await response.json();
	} catch {
		return { success: false, message: "Connection to ROBCO mainframe lost" };
	}
}

export default apiFetch;
```

- [ ] **Step 2: Commit**

```
git add src/api.js
git commit -m "Add a fetch helper for the api"
```

### Task B2: LogIn and SignUp — apiFetch, null guards, no console logs

**Files:**
- Modify: `src/components/LogIn.jsx`
- Modify: `src/components/SignUp.jsx`

- [ ] **Step 1: LogIn.jsx** — add `import apiFetch from "../api";` at top, drop the `API_URL` line, and replace `handleLogIn` with:

```js
	async function handleLogIn(e) {
		e.preventDefault();
		const username = document.querySelector("#username");
		const password = document.querySelector("#password");
		const json = await apiFetch("/log-in", {
			method: "POST",
			body: JSON.stringify({
				username: username.value,
				password: password.value,
			}),
		});
		if (json.success) {
			props.isLoggedInSetter(true);
			props.userSetter(json.user);
			props.userListSetter(json.userList);
			props.terminalMessageSetter(json.message + ".");
			const audio = new Audio(props.passGood);
			audio.play();
		} else {
			props.terminalMessageSetter(json.message + ".");
			username.value = "";
			password.value = "";
			document.querySelector(".selected")?.classList.remove("selected");
			const audio = new Audio(props.passBad);
			audio.play();
		}
		setInitialScale();
	}
```

- [ ] **Step 2: SignUp.jsx** — same imports change, replace `handleSignUp` with:

```js
	async function handleSignUp(e) {
		e.preventDefault();
		const username = document.querySelector("#username");
		const password = document.querySelector("#password");
		const confirm = document.querySelector("#confirm");
		const json = await apiFetch("/sign-up", {
			method: "POST",
			body: JSON.stringify({
				username: username.value,
				password: password.value,
				confirm: confirm.value,
			}),
		});
		if (json.success) {
			props.pageSetter("NavPage");
			props.terminalMessageSetter(json.message + ".");
			const audio = new Audio(props.passGood);
			audio.play();
		} else {
			username.value = "";
			password.value = "";
			confirm.value = "";
			props.terminalMessageSetter((json.errors?.[0]?.msg || json.message) + ".");
			const audio = new Audio(props.passBad);
			audio.play();
		}
		document.querySelector(".selected")?.classList.remove("selected");
	}
```

- [ ] **Step 3: Commit**

```
git add src/components/LogIn.jsx src/components/SignUp.jsx
git commit -m "Show a terminal message when requests fail"
```

### Task B3: Inbox, Sent, UserList — empty states, null guards, no console logs

**Files:**
- Modify: `src/components/Inbox.jsx`
- Modify: `src/components/Sent.jsx`
- Modify: `src/components/UserList.jsx`

- [ ] **Step 1: Inbox.jsx** — full new content:

```js
function Inbox(props) {
	function goToMessage(e, i) {
		props.messageIndex.current = i;
		props.messageType.current = "Inbox";
		props.pageSetter(e.target.id);
	}

	function nextPage() {
		props.listPageSetter(props.listPage + 1);
		document.querySelector(".selected")?.classList.remove("selected");
	}

	function previousPage() {
		props.listPageSetter(props.listPage - 1);
		document.querySelector(".selected")?.classList.remove("selected");
	}

	const messages = [];
	props.user.messagesReceived.forEach((message, index) => {
		const title = props.htmlDecode(message.title);
		messages.push(
			<li id="Message" key={index} onClick={(e) => goToMessage(e, index)}>
				[{title}]
			</li>
		);
	});

	if (messages.length === 0) {
		return <div>No messages.</div>;
	}

	const rowAmount = Math.floor(
		(props.mainHeight - props.liHeight.current * 3) / props.liHeight.current
	);
	const pageCount = Math.ceil(messages.length / rowAmount);

	let pages = [];
	for (let i = 0; i < pageCount; i++) {
		pages[i] = messages.splice(0, rowAmount);
	}

	if (pages[props.listPage]?.length > 0) {
		return (
			<ul>
				{pages[props.listPage]}
				{props.listPage > 0 && <li onClick={previousPage}>[Previous Page]</li>}
				{props.listPage < pageCount - 1 && (
					<li onClick={nextPage}>[Next Page]</li>
				)}
			</ul>
		);
	}
}

export default Inbox;
```

- [ ] **Step 2: Sent.jsx** — identical shape: `messageType.current = "Sent"`, iterate `props.user.messagesSent`, same `if (messages.length === 0) return <div>No messages.</div>;`, same `?.` guards, no console logs.

- [ ] **Step 3: UserList.jsx** — add `?.` to both `.selected` removals in `nextPage`/`previousPage` (the `pages[props.listPage]?.length` guard already exists from the earlier fix).

- [ ] **Step 4: Commit**

```
git add src/components/Inbox.jsx src/components/Sent.jsx src/components/UserList.jsx
git commit -m "Show no messages line and guard empty selections"
```

### Task B4: Message.jsx — missing-message guard, drop debug log

**Files:**
- Modify: `src/components/Message.jsx`

- [ ] **Step 1: Guard the missing message**

In the `else` branch that logs "Message data not found", add a fallback after the `console.error` (the error log stays — genuine failure path):

```js
		message = { title: "", body: "", timestamp: Date.now() };
```

- [ ] **Step 2: Remove the debug log**

Delete the `console.log("[Message.jsx] Calling onMessageReady with data:", messageContentData);` lines. The `console.error("Message pagination failed...")` stays.

- [ ] **Step 3: Commit**

```
git add src/components/Message.jsx
git commit -m "Don't crash when a message is missing"
```

### Task B5: SendMessage.jsx — apiFetch, no client-side push, remove Add page

**Files:**
- Modify: `src/components/SendMessage.jsx`

- [ ] **Step 1: Apply changes**

- Add `import apiFetch from "../api";`, drop the `API_URL` line.
- Replace `handleSendMessage` with:

```js
	async function handleSendMessage(e) {
		e.preventDefault();
		const { receiver, title, body } = formData;
		const json = await apiFetch("/message", {
			method: "POST",
			body: JSON.stringify({ receiver, title, body }),
		});
		if (json.success) {
			props.pageSetter("NavPage");
			props.terminalMessageSetter(json.message + ".");
			new Audio(props.passGood).play();
		} else {
			props.terminalMessageSetter(
				(json.errors?.[0]?.msg || json.message) + "."
			);
			new Audio(props.passBad).play();
		}
	}
```

- Delete the `addPage` function and the `<li onClick={addPage}>[Add page]</li>` line.

- [ ] **Step 2: Commit**

```
git add src/components/SendMessage.jsx
git commit -m "Send messages through the session and drop add page"
```

### Task B6: App.jsx — inbox refresh, power-on splash, arrow-key guards

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/NavPage.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: App.jsx changes**

1. Add `import apiFetch from "./api";` and a `const [poweredOn, setPoweredOn] = useState(false);` with the other state.
2. Delete `let firstEnter = useRef(true);` and the whole `forceFullscreen` function.
3. Replace `goToPage` with (refresh on Inbox/Sent, no more fullscreen block):

```js
	async function goToPage(e) {
		const targetPage = e.target.id;

		const terminalCursor = document.querySelector(".terminal-cursor");
		if (terminalCursor && !terminalCursor.classList.contains("invisible")) {
			terminalCursor.classList.add("invisible");
		}

		setTerminalMessage("");

		if (messageStep == "message") {
			setMessageStep("details");
			return;
		}

		if (page === "Message") {
			didInitialMessageAnimation.current = false;
			setIsMessageReady(false);
			if (messagePageContent) {
				setMessagePageContent(null);
			}
		} else if (targetPage === "Message") {
			setIsMessageReady(false);
		}

		if ((targetPage === "Inbox" || targetPage === "Sent") && isLoggedIn) {
			const json = await apiFetch("/messages");
			if (json.success) {
				setUser((prev) => ({
					...prev,
					messagesReceived: json.messagesReceived,
					messagesSent: json.messagesSent,
				}));
			} else {
				setTerminalMessage(json.message + ".");
				return;
			}
		}

		if (targetPage == "NavPage") setListPage(0);
		setPage(targetPage);
	}
```

4. In the line-printing effect, add `if (!poweredOn) return;` as the first statement and `poweredOn` to its dependency array.
5. In the mount effect's ArrowUp / ArrowDown handlers, change both conditions to include `items.current &&` before `selectedItem.current ...`.
6. In the mount effect, delete the `loopAudio(fanHum);` line (moves to `powerOn`).
7. Add `powerOn` + splash keydown effect (next to the other effects):

```js
	function powerOn() {
		if (document.fullscreenElement == null) {
			document.documentElement.requestFullscreen().catch(() => {});
		}
		if (!audioContextRef.current) {
			audioContextRef.current = new AudioContext();
		}
		loopAudio(fanHum);
		setPoweredOn(true);
	}

	useEffect(() => {
		if (poweredOn) return;
		function keyPowerOn() {
			powerOn();
		}
		window.addEventListener("keydown", keyPowerOn);
		return () => window.removeEventListener("keydown", keyPowerOn);
	}, [poweredOn]);
```

8. Immediately before the final `return (`, add the splash gate (after all hooks):

```js
	if (!poweredOn) {
		return (
			<div className="scanlines">
				<div className="power-on" onClick={powerOn}>
					<span className="power-on-text">CLICK TO POWER ON</span>
				</div>
			</div>
		);
	}
```

- [ ] **Step 2: NavPage.jsx** — add `import apiFetch from "../api";` and call the logout route:

```js
	function logOut() {
		apiFetch("/log-out", { method: "POST" });
		props.terminalMessageSetter("Logged out.");
		props.isLoggedInSetter(false);
	}
```

- [ ] **Step 3: index.css** — add:

```css
.power-on {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100svh;
	cursor: pointer;
}

.power-on-text {
	animation: blink 1s steps(1) infinite;
}
```

- [ ] **Step 4: Commit**

```
git add src/App.jsx src/components/NavPage.jsx src/index.css
git commit -m "Add power on screen and refresh messages on open"
```

### Task B7: Error boundary

**Files:**
- Create: `src/components/SystemFailure.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Create `src/components/SystemFailure.jsx`**

```jsx
import { Component } from "react";

class SystemFailure extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="scanlines">
					<div className="content">
						<div className="top">
							<div>Welcome to ROBCO Industries (TM) Termlink</div>
							<br />
						</div>
						<div className="main">
							<div>SYSTEM FAILURE</div>
							<br />
							<ul>
								<li
									className="selected"
									onClick={() => window.location.reload()}
								>
									[Reboot terminal]
								</li>
							</ul>
						</div>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}

export default SystemFailure;
```

- [ ] **Step 2: main.jsx**

```jsx
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import SystemFailure from "./components/SystemFailure.jsx";

createRoot(document.getElementById("root")).render(
	<SystemFailure>
		<App />
	</SystemFailure>
);
```

- [ ] **Step 3: Commit**

```
git add src/components/SystemFailure.jsx src/main.jsx
git commit -m "Show a system failure screen instead of a blank page"
```

### Task B8: Preview verification (against the live API)

- [ ] **Step 1: Reload preview**, confirm the splash renders (`.power-on` present, terminal absent).
- [ ] **Step 2: Click the splash** — terminal boots, lines print. (Fullscreen request may be rejected in the preview harness; a caught rejection is fine.)
- [ ] **Step 3: Log in** as `vault_dweller` / `GaryGaryGary1!` — expect "Login successful." **If the preview browser blocks the cross-site cookie** (localhost → sslip.io), subsequent `/messages` calls 401: then verify cookie flows via PowerShell `-WebSession` instead (Task A6 already did) and only verify UI behavior here.
- [ ] **Step 4: Open Inbox** — expect either messages or a printed "No messages." line; no crash, `#root` non-empty.
- [ ] **Step 5: Open Sent** — same.
- [ ] **Step 6: Compose flow** — To: `Grelgn`, Subject: `ping`, body, send → "Message sent." Then Sent shows it (refresh worked).
- [ ] **Step 7: Connection-failure message** — `preview_eval`: `window.fetch = () => Promise.reject(new Error("down"))`, then log out and log in again → terminal prints "Connection to ROBCO mainframe lost." Reload to restore fetch.
- [ ] **Step 8: Build**

Run: `npm run build`
Expected: exit 0.

### Task B9: Push, deploy, live verification

- [ ] **Step 1:** `git push origin main` (both repos if anything is unpushed).
- [ ] **Step 2:** Deploy frontend uuid `bgks0wcccwoog0k04gwk0cwk`, poll until `finished`, confirm the live bundle hash matches the local `dist/` build.
- [ ] **Step 3:** Live smoke: fetch the live index + bundle; confirm new bundle, then verify a full session flow against prod with PowerShell `-WebSession` (login → `GET /messages` 200 → `POST /message` → logout → 401).
