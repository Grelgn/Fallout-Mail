import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import NavPage from "./components/NavPage";
import { useCallback, useEffect, useRef, useState } from "react";
import SendMessage from "./components/SendMessage";
import Inbox from "./components/Inbox";
import Sent from "./components/Sent";
import UserList from "./components/UserList";
import Message from "./components/Message";

const charEnter = Object.keys(
	import.meta.glob("/src/assets/sounds/CharEnter*.wav")
);
const charSingle = Object.keys(
	import.meta.glob("/src/assets/sounds/CharSingle*.wav")
);
import charScroll from "/src/assets/sounds/CharScroll_LP.wav";
const hardDrive = Object.keys(
	import.meta.glob("/src/assets/sounds/HardDrive*.wav")
);
import fanHum from "/src/assets/sounds/FanHum_LP.wav";
import passBad from "/src/assets/sounds/PassBad.wav";
import passGood from "/src/assets/sounds/PassGood.wav";

function App() {
	const [isMessageReady, setIsMessageReady] = useState(false);

	const [page, setPage] = useState("NavPage");
	const pageSetter = useCallback(
		(val) => {
			setPage(val);
		},
		[setPage]
	);

	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const isLoggedInSetter = useCallback(
		(val) => {
			setIsLoggedIn(val);
			setPage("NavPage");
			setIsMessageReady(false);
		},
		[setIsLoggedIn]
	);

	const [user, setUser] = useState(null);
	const userSetter = useCallback(
		(val) => {
			setUser(val);
		},
		[setUser]
	);

	const [userList, setUserList] = useState([]);
	const userListSetter = useCallback(
		(val) => {
			setUserList(val);
		},
		[setUserList]
	);

	let firstEnter = useRef(true);

	function goToPage(e) {
		setTerminalMessage("");
		if (messageStep == "message") {
			setMessageStep("details");
			return;
		}
		if (page === "Message" || e.target.id === "Message") {
			setIsMessageReady(false);
		}
		if (e.target.id == "NavPage") setListPage(0);
		setPage(e.target.id);
		if (firstEnter.current) {
			forceFullscreen();
			firstEnter.current = false;
		}
	}

	let items = useRef();
	let selectedItem = useRef(0);
	let lines = useRef([]);

	const [listPage, setListPage] = useState(0);
	const listPageSetter = useCallback(
		(val) => {
			setListPage(val);
		},
		[setListPage]
	);

	const [terminalMessage, setTerminalMessage] = useState("");
	const terminalMessageSetter = useCallback(
		(val) => {
			setTerminalMessage(val);
		},
		[setTerminalMessage]
	);

	const [messageStep, setMessageStep] = useState("details");
	const messageStepSetter = useCallback(
		(val) => {
			setMessageStep(val);
		},
		[setMessageStep]
	);

	const [contentVersion, setContentVersion] = useState(0);
	const triggerContentUpdate = useCallback(() => {
		setContentVersion((v) => v + 1);
	}, []);

	// Every page change
	useEffect(() => {
		// Don't start printing lines for the Message page until it signals it's ready
		if (page === "Message" && !isMessageReady) {
			console.log("Message page detected, waiting for content readiness...");
			const mainArea = document.querySelector(".content .main");
			if (mainArea) {
				const oldCursorsInMain = mainArea.querySelectorAll(".cursor");
				oldCursorsInMain.forEach((c) => {
					c.remove();
				});
				console.log(
					`Removed ${oldCursorsInMain.length} cursors from .main while waiting for message.`
				);
			} else {
				console.warn(".main area not found for initial cursor cleanup.");
			}
			return;
		}
		if (page !== "Message" && isMessageReady) {
			setIsMessageReady(false);
		}
		console.log("Conditions met, running renderLines for page:", page);

		const mainArea = document.querySelector(".content .main");
		if (mainArea) {
			// Select and remove only cursors found *within* the .main area
			const oldCursorsInMain = mainArea.querySelectorAll(".cursor");
			oldCursorsInMain.forEach((c) => {
				c.remove();
			});
		} else {
			console.warn(".main area not found for cursor cleanup.");
		}
		const topArea = document.querySelector(".content .top");
		if (topArea) {
			const oldCursorsInTop = topArea.querySelectorAll(".cursor");
			oldCursorsInTop.forEach((c) => c.remove());
		}

		renderLines();
	}, [
		page,
		listPage,
		isLoggedIn,
		user,
		terminalMessage,
		messageStep,
		contentVersion,
		isMessageReady,
	]);

	function renderLines() {
		const selected = document.querySelector(".selected");
		if (selected) selected.classList.remove("selected");

		selectedItem.current = 0;
		items.current = document.querySelectorAll(".main li");

		const topContent = document.querySelector(".content .top");
		const mainContent = document.querySelector(".content .main");

		if (!mainContent) {
			console.error("mainContent area not found for renderLines");
			return;
		}
		if (!topContent) {
			console.error("topContent area not found for renderLines");
		}

		console.log("Hiding .main area initially.");
		mainContent.classList.add("invisible");

		lines.current = [];
		lineTime.current = 0;

		if (topContent) {
			const topDivs = topContent.querySelectorAll(":scope > div");
			topDivs.forEach((div) => {
				if (
					div.childNodes.length >= 1 &&
					div.firstChild.nodeType === Node.TEXT_NODE &&
					div.firstChild.textContent.trim()
				) {
					console.log("Adding top line node:", div.firstChild);
					lines.current.push(div.firstChild);
				} else {
					console.log("Skipping complex or empty top div:", div);
				}
			});
		} else {
			console.warn("Cannot add top lines, .top element not found.");
		}

		getLines(mainContent.childNodes);
		printLines(lines.current);

		const audio = new Audio(
			hardDrive[Math.floor(Math.random() * hardDrive.length)]
		);
		audio.play();
	}

	function getLines(nodes) {
		nodes.forEach((node) => {
			if (node.nodeName == "BR" || node.className == "arrow") {
				return;
			}

			if (
				node.nodeName === "LI" ||
				node.nodeName === "INPUT" ||
				node.nodeName === "TEXTAREA"
			) {
				if (
					node.nodeName === "LI" &&
					node.childNodes.length === 1 &&
					node.firstChild.nodeType === Node.TEXT_NODE &&
					node.firstChild.textContent.trim()
				) {
					lines.current.push(node.firstChild);
				} else if (node.nodeName === "INPUT" || node.nodeName === "TEXTAREA") {
					lines.current.push(node);
				} else if (node.nodeName === "LI" && node.querySelector("button")) {
					const buttonText = node.querySelector("button")?.textContent;
					if (buttonText && node.querySelectorAll("*").length === 1) {
						getLines(node.childNodes);
					} else {
						getLines(node.childNodes);
					}
				} else {
					getLines(node.childNodes);
				}
			} else if (
				node.nodeType === Node.ELEMENT_NODE &&
				node.classList?.contains("message-display")
			) {
				getLines(node.childNodes);
			} else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
				lines.current.push(node);
			} else if (
				node.nodeType === Node.ELEMENT_NODE &&
				node.childNodes.length > 0
			) {
				getLines(node.childNodes);
			}
		});
	}

	let charTime = useRef(10);
	let lineTime = useRef(0);
	let firstLoad = useRef(true);
	let firstLogin = useRef(true);
	const isPrintingLines = useRef(false);

	useEffect(() => {
		isLoggedIn ? (firstLogin.current = false) : (firstLogin.current = true);
	}, [isLoggedIn]);

	function printLines(l) {
		animateTerminalMessage(terminalMessage);

		const terminalCursor = document.querySelector(".terminal-cursor");
		if (terminalCursor) {
			terminalCursor.classList.add("invisible");
		}

		isPrintingLines.current = true;
		lineTime.current = 0;

		const mainContent = document.querySelector(".content .main");
		if (mainContent && mainContent.classList.contains("invisible")) {
			console.log("Revealing .main area for animation.");
			mainContent.classList.remove("invisible");
		}

		const audio = new Audio(charScroll);
		audio.loop = true;
		audio.play().catch((e) => console.error("Error playing charScroll:", e));

		const initialCharDelay = 30;

		l.forEach((line, index) => {
			// --- Determine Text and Target ---
			let lineText = "";
			let targetElement = line;
			let isTextNode = false;
			let isInput = false;
			let isTextArea = false;
			let parentForCursor = null;
			let originalText = "";

			if (line.nodeType === Node.TEXT_NODE) {
				originalText = line.textContent;
				lineText = originalText;
				isTextNode = true;
				parentForCursor = line.parentNode;
			} else if (line.nodeName === "INPUT") {
				originalText = line.value;
				lineText = originalText;
				isInput = true;
				targetElement = line;
				parentForCursor = line.parentNode;
			} else if (line.nodeName === "TEXTAREA") {
				originalText = line.value;
				lineText = originalText;
				isTextArea = true;
				targetElement = line;
				parentForCursor = line.parentNode;
			} else {
				console.log(
					"Skipping unhandled node type in printLines:",
					line.nodeName,
					line
				);
				return;
			}

			if (!lineText && lineText !== "") {
				console.log("Skipping node with no text content:", line);
				return;
			}

			// --- Conditional Animation Logic ---
			let shouldAnimate = true;
			if (index === 0 && !firstLoad.current) {
				shouldAnimate = false;
				console.log("Skipping animation for line 0 (firstLoad=false)");
			}
			if (index === 1 && isLoggedIn && !firstLogin.current) {
				shouldAnimate = false;
				console.log(
					"Skipping animation for line 1 (isLoggedIn=true, firstLogin=false)"
				);
			}

			// Calculate timing *only* if animating
			const animationDuration = shouldAnimate
				? initialCharDelay + charTime.current * lineText.length
				: 0;
			const currentLineStartTime = lineTime.current;

			if (shouldAnimate) {
				// --- Schedule Animation ---
				const cursor = document.createElement("span");
				cursor.textContent = "▇";
				cursor.classList.add("cursor");
				cursor.style.animationDelay =
					-(currentLineStartTime + initialCharDelay) + "ms";

				if (isTextNode) {
					targetElement.textContent = "";
					setTimeout(() => {
						// Try to append cursor to the parent
						if (parentForCursor && !parentForCursor.querySelector(".cursor")) {
							if (targetElement.nextSibling) {
								parentForCursor.insertBefore(cursor, targetElement.nextSibling);
							} else {
								parentForCursor.appendChild(cursor);
							}
						} else if (parentForCursor) {
							console.warn("Cursor already exists in parent:", parentForCursor);
						}

						for (let i = 0; i < lineText.length; i++) {
							setTimeout(() => {
								if (document.body.contains(targetElement)) {
									if (targetElement.textContent?.length === i) {
										targetElement.textContent += lineText[i];
									} else if (i === 0) {
										targetElement.textContent = lineText[i];
									}
								}
							}, initialCharDelay + charTime.current * i);
						}
					}, currentLineStartTime);

					setTimeout(() => {
						cursor.remove();
					}, currentLineStartTime + animationDuration);
				} else if (isInput) {
					targetElement.value = "";
					setTimeout(() => {
						for (let i = 0; i < lineText.length; i++) {
							setTimeout(() => {
								if (document.body.contains(targetElement)) {
									targetElement.value += lineText[i];
								}
							}, initialCharDelay + charTime.current * i);
						}
					}, currentLineStartTime);
				} else if (isTextArea) {
					targetElement.value = "";
					targetElement.classList.add("invisible");

					setTimeout(() => {
						if (document.body.contains(targetElement)) {
							targetElement.classList.remove("invisible"); // Make visible just before typing starts
							for (let i = 0; i < lineText.length; i++) {
								setTimeout(() => {
									if (document.body.contains(targetElement)) {
										targetElement.value += lineText[i];
									}
								}, initialCharDelay + charTime.current * i);
							}
						}
					}, currentLineStartTime);
				}
			} else {
				// --- Not animating: Ensure final text is present immediately ---
				if (isTextNode) {
					targetElement.textContent = originalText;
				} else if (isInput || isTextArea) {
					targetElement.value = originalText;
					if (isTextArea && targetElement.classList.contains("invisible")) {
						targetElement.classList.remove("invisible");
					}
				}
			}

			// --- Update Total Time ---
			lineTime.current += animationDuration;
		});

		// --- Final Actions After All Lines Scheduled ---
		const finalAnimationTime = lineTime.current;

		setTimeout(() => {
			audio.pause();
			audio.currentTime = 0;

			if (
				items.current &&
				items.current.length > 0 &&
				selectedItem.current < items.current.length &&
				items.current[selectedItem.current]
			) {
				items.current[selectedItem.current].classList.add("selected");
				setTimeout(() => {
					const focusTarget = items.current[
						selectedItem.current
					]?.querySelector("input, button, textarea, a");
					if (focusTarget) {
						focusTarget.focus({ preventScroll: true });
					}
				}, 50);
			} else {
				console.log(
					"Could not select/focus item:",
					selectedItem.current,
					items.current?.length
				);
			}

			const endAudio = new Audio(
				charSingle[Math.floor(Math.random() * charSingle.length)]
			);
			endAudio
				.play()
				.catch((e) => console.error("Error playing charSingle:", e));

			if (terminalCursor) {
				terminalCursor.classList.remove("invisible");
			}

			isPrintingLines.current = false;
			if (isLoggedIn && firstLogin.current) {
				console.log("Setting firstLogin.current to false");
				firstLogin.current = false;
			}
			console.log("Printing finished. Total time:", finalAnimationTime);
		}, finalAnimationTime + 50);

		if (firstLoad.current) {
			console.log("Setting firstLoad.current to false");
			firstLoad.current = false;
		}
	}

	// Audio Loop
	const audioContext = new AudioContext();
	async function loopAudio(audioUrl) {
		const response = await fetch(audioUrl);
		const arrayBuffer = await response.arrayBuffer();

		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

		const bufferSource = audioContext.createBufferSource();
		bufferSource.buffer = audioBuffer;

		const gainNode = audioContext.createGain();
		gainNode.gain.value = 0.1;

		bufferSource.loop = true;

		bufferSource.connect(gainNode);
		gainNode.connect(audioContext.destination);

		bufferSource.start(0);

		return {
			source: bufferSource,
			gainNode: gainNode,
		};
	}

	const mainMargin = useRef(150 + 100 + 20 + 20);
	const liHeight = useRef(0);

	// Only once
	useEffect(() => {
		window.addEventListener("keydown", (e) => {
			if (
				e.key === "ArrowUp" &&
				!isPrintingLines.current &&
				selectedItem.current > 0
			) {
				e.preventDefault();
				document.activeElement.blur();
				items.current[selectedItem.current].classList.remove("selected");
				selectedItem.current -= 1;
				items.current[selectedItem.current].classList.add("selected");
				if (items.current[selectedItem.current].children.length > 0) {
					items.current[selectedItem.current].children[0].focus();
				}
				const audio = new Audio(
					charSingle[Math.floor(Math.random() * charSingle.length)]
				);
				audio.play();
			}
			if (
				e.key === "ArrowDown" &&
				!isPrintingLines.current &&
				selectedItem.current < items.current.length - 1
			) {
				e.preventDefault();
				document.activeElement.blur();
				items.current[selectedItem.current].classList.remove("selected");
				selectedItem.current += 1;
				items.current[selectedItem.current].classList.add("selected");
				if (items.current[selectedItem.current].children.length > 0) {
					items.current[selectedItem.current].children[0].focus();
				}
				const audio = new Audio(
					charSingle[Math.floor(Math.random() * charSingle.length)]
				);
				audio.play();
			}
			if (e.key === "Enter" && !isPrintingLines.current) {
				const audio = new Audio(
					charEnter[Math.floor(Math.random() * charEnter.length)]
				);
				audio.play();
				if (e.target.nodeName == "INPUT") {
					e.preventDefault();
					return;
				}
				items.current[selectedItem.current].click();
			}
			if (e.key === "Tab") {
				e.preventDefault();
			}
		});

		window.addEventListener("keyup", (e) => {
			if (
				(document.activeElement.nodeName == "INPUT" ||
					document.activeElement.nodeName == "TEXTAREA") &&
				e.key != "Enter" &&
				e.key != "ArrowDown" &&
				e.key != "ArrowUp" &&
				e.key != " "
			) {
				const audio = new Audio(
					charSingle[Math.floor(Math.random() * charSingle.length)]
				);
				audio.play();
			}
			if (e.key === " ") {
				const audio = new Audio(
					charEnter[Math.floor(Math.random() * charEnter.length)]
				);
				audio.play();
			}
		});

		loopAudio(fanHum);
	}, []);

	let messageIndex = useRef(0);
	let messageType = useRef();

	function htmlDecode(input) {
		var doc = new DOMParser().parseFromString(input, "text/html");
		return doc.documentElement.textContent;
	}

	const [mainHeight, setMainHeight] = useState(0);
	const mainHeightSetter = useCallback(
		(val) => {
			setMainHeight(val);
		},
		[setMainHeight]
	);

	useEffect(() => {
		if (["Inbox", "Sent", "UserList"].includes(page)) renderLines();
	}, [mainHeight]);

	const [resized, setResized] = useState(0);

	function windowResize() {
		// Set scale
		const li = document.querySelector("li:last-of-type").clientHeight;
		const oldLi = liHeight.current;
		if (oldLi != li) {
			liHeight.current = li;
			mainMargin.current = li * 5 + 20 + 20;
		}
		const windowHeight = window.innerHeight;
		const height = windowHeight - mainMargin.current;

		if (
			Math.floor(mainHeight / liHeight.current) !=
				Math.floor(height / liHeight.current) ||
			oldLi != liHeight.current
		) {
			console.log("RESIZED");
			setResized(resized + 1);
			if (li * 4 < height) setMainHeight(height);
			else setMainHeight(li * 4);

			setListPage(0);
		}
	}

	let resizeDelay;
	window.onresize = () => {
		clearTimeout(resizeDelay);
		resizeDelay = setTimeout(windowResize, 1000);
	};

	function formatDate(date, includeTime) {
		let month = date.toLocaleString("en-us", { month: "long" });
		const day = date.getDate();
		let hours = date.getHours().toString();
		let minutes = date.getMinutes().toString();
		let year = date.getFullYear();

		year += 50;

		if (hours.length == 1) hours = "0" + hours;
		if (minutes.length == 1) minutes = "0" + minutes;

		if (includeTime) {
			return month + " " + day + ", " + year + ", " + hours + ":" + minutes;
		} else {
			return month + " " + day + ", " + year;
		}
	}

	function forceFullscreen() {
		if (window.innerHeight != screen.height) {
			document.documentElement.requestFullscreen();
		}
	}

	function animateTerminalMessage(message) {
		const targetElement = document.getElementById("terminal-message-text");
		const terminalCursor = document.querySelector(".terminal-cursor"); // The cursor next to the message

		if (!targetElement) {
			console.error(
				"Terminal message target element (#terminal-message-text) not found."
			);
			return;
		}
		if (!terminalCursor) {
			console.warn(
				"Terminal cursor (.terminal-cursor) not found for message animation."
			);
		}

		if (!message || message.trim() === "") {
			targetElement.textContent = "";
			if (terminalCursor) terminalCursor.classList.remove("invisible");
			return;
		}

		targetElement.textContent = "";
		if (terminalCursor) terminalCursor.classList.remove("invisible");

		let messageAnimationTime = 0;
		const charDelay = charTime.current;

		for (let i = 0; i < message.length; i++) {
			setTimeout(() => {
				if (targetElement.textContent?.length === i) {
					targetElement.textContent += message[i];
				} else if (i === 0) {
					targetElement.textContent = message[i];
				}
			}, charDelay * i);
			messageAnimationTime = charDelay * (i + 1);
		}
	}

	return (
		<>
			<div className="scanlines">
				<div className="content">
					<div className="top">
						<div>Welcome to ROBCO Industries (TM) Termlink</div>
						{isLoggedIn && <div>Welcome, {user.username}!</div>}
						<br />
					</div>
					<div className="main">
						{page == "NavPage" && (
							<NavPage
								goToPage={goToPage}
								pageSetter={pageSetter}
								isLoggedIn={isLoggedIn}
								user={user}
								isLoggedInSetter={isLoggedInSetter}
								terminalMessageSetter={terminalMessageSetter}
							/>
						)}
						{page == "SignUp" && (
							<SignUp
								terminalMessageSetter={terminalMessageSetter}
								pageSetter={pageSetter}
								passBad={passBad}
								passGood={passGood}
							/>
						)}
						{page == "LogIn" && (
							<LogIn
								isLoggedInSetter={isLoggedInSetter}
								userSetter={userSetter}
								userListSetter={userListSetter}
								terminalMessageSetter={terminalMessageSetter}
								passBad={passBad}
								passGood={passGood}
								liHeight={liHeight}
								mainMargin={mainMargin}
								mainHeightSetter={mainHeightSetter}
							/>
						)}
						{page == "SendMessage" && (
							<SendMessage
								user={user}
								terminalMessageSetter={terminalMessageSetter}
								pageSetter={pageSetter}
								userList={userList}
								passBad={passBad}
								passGood={passGood}
								liHeight={liHeight}
								messageStep={messageStep}
								messageStepSetter={messageStepSetter}
								resized={resized}
							/>
						)}
						{page == "Inbox" && (
							<Inbox
								user={user}
								pageSetter={pageSetter}
								messageIndex={messageIndex}
								messageType={messageType}
								listPage={listPage}
								listPageSetter={listPageSetter}
								htmlDecode={htmlDecode}
								mainHeight={mainHeight}
								liHeight={liHeight}
							/>
						)}
						{page == "Sent" && (
							<Sent
								user={user}
								pageSetter={pageSetter}
								messageIndex={messageIndex}
								messageType={messageType}
								listPage={listPage}
								listPageSetter={listPageSetter}
								htmlDecode={htmlDecode}
								mainHeight={mainHeight}
								liHeight={liHeight}
							/>
						)}
						{page == "Message" && (
							<Message
								user={user}
								messageIndex={messageIndex}
								messageType={messageType}
								htmlDecode={htmlDecode}
								formatDate={formatDate}
								liHeight={liHeight}
								triggerContentUpdate={triggerContentUpdate}
								onMessageReady={() => setIsMessageReady(true)}
							/>
						)}
						{page == "UserList" && (
							<UserList
								userList={userList}
								listPage={listPage}
								listPageSetter={listPageSetter}
								mainHeight={mainHeight}
								formatDate={formatDate}
								liHeight={liHeight}
							/>
						)}
						{page != "NavPage" && page != "Message" && (
							<ul className="go-back">
								<li id="NavPage" onClick={goToPage}>
									[Go back]
								</li>
							</ul>
						)}
						{page == "Message" && (
							<ul>
								<li id={messageType.current} onClick={goToPage}>
									[Go back]
								</li>
							</ul>
						)}
					</div>
					<div className="end">
						<br />
						<span className="arrow">></span>{" "}
						<span id="terminal-message-text">{terminalMessage}</span>{" "}
						<span className="cursor terminal-cursor">▇</span>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
