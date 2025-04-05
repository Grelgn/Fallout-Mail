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
	const [messagePageContent, setMessagePageContent] = useState(null);
	const [page, setPage] = useState("NavPage");
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [user, setUser] = useState(null);
	const [userList, setUserList] = useState([]);
	const [listPage, setListPage] = useState(0);
	const [terminalMessage, setTerminalMessage] = useState("");
	const [messageStep, setMessageStep] = useState("details");
	const [contentVersion, setContentVersion] = useState(0);

	const pageSetter = useCallback(
		(val) => {
			setPage(val);
		},
		[setPage]
	);
	const isLoggedInSetter = useCallback(
		(val) => {
			setIsLoggedIn(val);
			setPage("NavPage");
			setIsMessageReady(false);
		},
		[setIsLoggedIn]
	);
	const userSetter = useCallback(
		(val) => {
			setUser(val);
		},
		[setUser]
	);
	const userListSetter = useCallback(
		(val) => {
			setUserList(val);
		},
		[setUserList]
	);
	const listPageSetter = useCallback(
		(val) => {
			setListPage(val);
		},
		[setListPage]
	);
	const terminalMessageSetter = useCallback(
		(val) => {
			setTerminalMessage(val);
		},
		[setTerminalMessage]
	);
	const messageStepSetter = useCallback(
		(val) => {
			setMessageStep(val);
		},
		[setMessageStep]
	);

	const handleMessageReady = useCallback(
		(contentData) => {
			setMessagePageContent(contentData);
			setIsMessageReady(true);
		},
		[setMessagePageContent, setIsMessageReady]
	);

	const triggerContentUpdate = useCallback(
		(updatedData = null) => {
			if (updatedData) {
				setMessagePageContent((prevContent) => ({
					...prevContent,
					...updatedData,
				}));
			}
			setContentVersion((v) => v + 1);
		},
		[setMessagePageContent]
	);

	let firstEnter = useRef(true);
	let items = useRef();
	let selectedItem = useRef(0);
	let lines = useRef([]);
	let charTime = useRef(10);
	let lineTime = useRef(0);
	let firstLoad = useRef(true);
	let firstLogin = useRef(true);
	const isPrintingLines = useRef(false);
	const mainMargin = useRef(150 + 100 + 20 + 20);
	const liHeight = useRef(0);
	let messageIndex = useRef(0);
	let messageType = useRef();
	const [mainHeight, setMainHeight] = useState(0);
	const [resized, setResized] = useState(0);

	const mainHeightSetter = useCallback(
		(val) => {
			setMainHeight(val);
		},
		[setMainHeight]
	);

	function goToPage(e) {
		const terminalCursor = document.querySelector(".terminal-cursor");
		if (terminalCursor && !terminalCursor.classList.contains("invisible")) {
			terminalCursor.classList.add("invisible");
			console.log("[goToPage] Hiding terminal cursor immediately.");
		}

		setTerminalMessage("");

		if (messageStep == "message") {
			setMessageStep("details");
			return;
		}
		if (page === "Message" || e.target.id === "Message") {
			setIsMessageReady(false);
			if (page === "Message" && messagePageContent) {
				setMessagePageContent(null);
			}
		}
		if (e.target.id == "NavPage") setListPage(0);

		setPage(e.target.id);

		if (firstEnter.current) {
			forceFullscreen();
			firstEnter.current = false;
		}
	}

	useEffect(() => {
		if (page === "Message" && (!isMessageReady || !messagePageContent)) {
			const mainArea = document.querySelector(".content .main");
			if (mainArea) {
				mainArea.querySelectorAll(".cursor").forEach((c) => c.remove());
			}
			return;
		}

		if (page !== "Message") {
			if (isMessageReady) setIsMessageReady(false);
			if (messagePageContent) setMessagePageContent(null);
		}

		const mainArea = document.querySelector(".content .main");
		if (mainArea) {
			mainArea.querySelectorAll(".cursor").forEach((c) => c.remove());
		}
		const topArea = document.querySelector(".content .top");
		if (topArea) {
			topArea.querySelectorAll(".cursor").forEach((c) => c.remove());
		}

		renderLines(page === "Message" ? messagePageContent : null);
	}, [
		page,
		listPage,
		isLoggedIn,
		user,
		terminalMessage,
		messageStep,
		contentVersion,
		isMessageReady,
		messagePageContent,
	]);

	function renderLines(messageData = null) {
		const selected = document.querySelector(".selected");
		if (selected) selected.classList.remove("selected");
		selectedItem.current = 0;
		items.current = document.querySelectorAll(".main li");
		const topContent = document.querySelector(".content .top");
		const mainContent = document.querySelector(".content .main");
		if (!mainContent) return;
		if (!topContent && !messageData) return;

		mainContent.classList.add("invisible");

		lines.current = [];

		if (page === "Message" && messageData) {
			if (topContent) {
				const topDivs = topContent.querySelectorAll(":scope > div");
				topDivs.forEach((div) => {
					if (div.id === "welcome-line" && isLoggedIn && user?.username) {
						const fullWelcomeText = `Welcome, ${user.username}!`;
						if (div.textContent !== fullWelcomeText)
							div.textContent = fullWelcomeText;
					}
					if (
						div.childNodes.length >= 1 &&
						div.firstChild.nodeType === Node.TEXT_NODE &&
						div.firstChild.textContent.trim()
					) {
						if (
							div.id === "welcome-line" ||
							div.textContent.startsWith("Welcome to ROBCO")
						) {
							lines.current.push(div.firstChild);
						}
					}
				});
			}

			const fromDiv = mainContent.querySelector("#message-from");
			const toDiv = mainContent.querySelector("#message-to");
			const dateDiv = mainContent.querySelector("#message-date");

			if (messageData.from && fromDiv) {
				fromDiv.textContent = messageData.from;
				lines.current.push(fromDiv);
			}
			if (messageData.to && toDiv) {
				toDiv.textContent = messageData.to;
				lines.current.push(toDiv);
			}
			if (messageData.date && dateDiv) {
				dateDiv.textContent = messageData.date;
				lines.current.push(dateDiv);
			}

			const bodyDiv = mainContent.querySelector(".message-display");
			if (bodyDiv) {
				bodyDiv.textContent = messageData.bodyPage || "";
				lines.current.push(bodyDiv);
			}

			const paginationList = mainContent.querySelector("ul");
			if (paginationList) {
				getLines(paginationList.childNodes);
			}
		} else {
			if (topContent) {
				const topDivs = topContent.querySelectorAll(":scope > div");
				topDivs.forEach((div) => {
					if (div.id === "welcome-line" && isLoggedIn && user?.username) {
						const fullWelcomeText = `Welcome, ${user.username}!`;
						if (div.textContent !== fullWelcomeText)
							div.textContent = fullWelcomeText;
					}
					if (
						div.childNodes.length >= 1 &&
						div.firstChild.nodeType === Node.TEXT_NODE &&
						div.firstChild.textContent.trim()
					) {
						if (
							div.id === "welcome-line" ||
							div.textContent.startsWith("Welcome to ROBCO")
						) {
							lines.current.push(div.firstChild);
						}
					}
				});
			}
			getLines(mainContent.childNodes);
		}

		printLines(lines.current);

		const audio = new Audio(
			hardDrive[Math.floor(Math.random() * hardDrive.length)]
		);
		audio.play();
	}

	function getLines(nodes) {
		nodes.forEach((node) => {
			if (node.nodeName === "BR" || node.className === "arrow") {
				return;
			}

			if (node.nodeName === "LI") {
				let textNode = null;
				if (
					(node.childNodes.length === 1 &&
						node.firstChild.nodeType === Node.TEXT_NODE &&
						node.firstChild.textContent.trim()) ||
					node.classList.contains("pagination-item") ||
					node.classList.contains("go-back")
				) {
					for (const child of node.childNodes) {
						if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
							textNode = child;
							break;
						}
					}
				}
				if (textNode) {
					lines.current.push(textNode);
				} else {
					getLines(node.childNodes);
				}
				return;
			}

			if (node.nodeName === "INPUT" || node.nodeName === "TEXTAREA") {
				lines.current.push(node);
				return;
			}

			if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
				if (
					!node.parentNode.id?.startsWith("message-") &&
					!node.parentNode.classList?.contains("message-display")
				) {
					lines.current.push(node);
				}
				return;
			}

			if (
				node.nodeType === Node.ELEMENT_NODE &&
				node.childNodes.length > 0 &&
				!["LI", "INPUT", "TEXTAREA"].includes(node.nodeName) &&
				!node.id?.startsWith("message-") &&
				!node.classList?.contains("message-display")
			) {
				getLines(node.childNodes);
			}
		});
	}
	useEffect(() => {
		if (!isLoggedIn) {
			firstLogin.current = true;
		}
	}, [isLoggedIn]);

	function printLines(l) {
		const terminalCursor = document.querySelector(".terminal-cursor");
		if (terminalCursor && !terminalCursor.classList.contains("invisible")) {
			terminalCursor.classList.add("invisible");
		}
		animateTerminalMessage(terminalMessage);
		isPrintingLines.current = true;
		const mainContent = document.querySelector(".content .main");

		const animationData = [];
		l.forEach((line, index) => {
			let shouldAnimate = true;
			if (index === 0 && !firstLoad.current) {
				shouldAnimate = false;
			}
			if (index === 1 && isLoggedIn && !firstLogin.current) {
				shouldAnimate = false;
			}

			let lineText = "";
			let targetElement = line;
			let isTextNode = false;
			let isInput = false;
			let isTextArea = false;
			let isDivElement = false;
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
			} else if (
				line.nodeName === "DIV" &&
				(line.id.startsWith("message-") ||
					line.classList.contains("message-display"))
			) {
				originalText = line.textContent;
				lineText = originalText;
				isDivElement = true;
				targetElement = line;
				parentForCursor = line;
			}

			if (
				!targetElement ||
				(isTextNode && !parentForCursor) ||
				typeof lineText !== "string"
			) {
				return;
			}

			if (shouldAnimate) {
				if (isTextNode || isDivElement) {
					targetElement.textContent = "";
				} else if (isInput || isTextArea) {
					targetElement.value = "";
					if (isTextArea) targetElement.classList.add("invisible");
				}
			}

			animationData.push({
				line,
				index,
				targetElement,
				originalText,
				lineText,
				isTextNode,
				isInput,
				isTextArea,
				isDivElement,
				parentForCursor,
				shouldAnimate,
			});
		});

		if (mainContent) {
			mainContent.classList.remove("invisible");
		}

		const audio = new Audio(charScroll);
		audio.loop = true;
		audio.play().catch((e) => console.error("Error playing charScroll:", e));
		const initialCharDelay = 30;
		let cumulativeTime = 0;

		animationData.forEach((data) => {
			const {
				line,
				index,
				targetElement,
				originalText,
				lineText,
				isTextNode,
				isInput,
				isTextArea,
				isDivElement,
				parentForCursor,
				shouldAnimate,
			} = data;

			const currentLineDuration = shouldAnimate
				? initialCharDelay + charTime.current * lineText.length
				: 0;
			const currentLineStartTime = cumulativeTime;

			if (shouldAnimate) {
				const cursor = document.createElement("span");
				cursor.textContent = "▇";
				cursor.classList.add("cursor");
				cursor.style.animationDelay =
					-(currentLineStartTime + initialCharDelay) + "ms";

				setTimeout(() => {
					if (parentForCursor && !parentForCursor.querySelector(".cursor")) {
						if (
							targetElement.nodeType === Node.TEXT_NODE &&
							targetElement.nextSibling
						) {
							parentForCursor.insertBefore(cursor, targetElement.nextSibling);
						} else if (
							parentForCursor.contains(targetElement) ||
							parentForCursor === targetElement
						) {
							parentForCursor.appendChild(cursor);
						} else {
							parentForCursor.appendChild(cursor);
						}
					} else if (isInput || isTextArea) {
						if (targetElement.parentNode && targetElement.nextSibling) {
							targetElement.parentNode.insertBefore(
								cursor,
								targetElement.nextSibling
							);
						} else if (targetElement.parentNode) {
							targetElement.parentNode.appendChild(cursor);
						}
					}

					if (isTextArea && document.body.contains(targetElement)) {
						targetElement.classList.remove("invisible");
					}

					for (let i = 0; i < lineText.length; i++) {
						setTimeout(() => {
							if (document.body.contains(targetElement)) {
								if (isTextNode || isDivElement) {
									if (targetElement.textContent?.length === i) {
										targetElement.textContent += lineText[i];
									} else if (i === 0) {
										targetElement.textContent = lineText[i];
									}
								} else if (isInput || isTextArea) {
									targetElement.value += lineText[i];
								}
							}
						}, initialCharDelay + charTime.current * i);
					}
				}, currentLineStartTime);

				setTimeout(() => {
					cursor.remove();
				}, currentLineStartTime + currentLineDuration);
			} else {
				if (isTextNode || isDivElement) {
					if (targetElement.textContent !== originalText)
						targetElement.textContent = originalText;
				} else if (isInput || isTextArea) {
					if (targetElement.value !== originalText)
						targetElement.value = originalText;
					if (isTextArea && targetElement.classList.contains("invisible")) {
						targetElement.classList.remove("invisible");
					}
				}
			}
			cumulativeTime += currentLineDuration;
		});

		lineTime.current = cumulativeTime;
		const mainContentAnimDuration = cumulativeTime;

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
			}

			const endAudio = new Audio(
				charSingle[Math.floor(Math.random() * charSingle.length)]
			);
			endAudio
				.play()
				.catch((e) => console.error("Error playing final charSingle:", e));

			if (terminalCursor) {
				terminalCursor.classList.remove("invisible");
			}

			isPrintingLines.current = false;
			if (isLoggedIn && firstLogin.current) {
				firstLogin.current = false;
			}
		}, mainContentAnimDuration + 100);

		if (firstLoad.current) {
			firstLoad.current = false;
		}
	}

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
		return { source: bufferSource, gainNode: gainNode };
	}

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

	function htmlDecode(input) {
		var doc = new DOMParser().parseFromString(input, "text/html");
		return doc.documentElement.textContent;
	}

	useEffect(() => {
		if (["Inbox", "Sent", "UserList"].includes(page)) renderLines();
	}, [mainHeight]);

	function windowResize() {
		const li = document.querySelector("li:last-of-type")?.clientHeight;
		if (!li) return;
		const oldLi = liHeight.current;
		if (oldLi != li) {
			liHeight.current = li;
			mainMargin.current = li * 5 + 20 + 20;
		}
		const windowHeight = window.innerHeight;
		const height = windowHeight - mainMargin.current;

		if (
			mainHeight === 0 ||
			Math.floor(mainHeight / liHeight.current) !=
				Math.floor(height / liHeight.current) ||
			oldLi != liHeight.current
		) {
			setResized((v) => v + 1);
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
		if (
			document.fullscreenElement == null &&
			window.innerHeight != screen.height
		) {
			document.documentElement.requestFullscreen().catch((err) => {
				console.error(
					`Error attempting to enable full-screen mode: ${err.message} (${err.name})`
				);
			});
		}
	}

	function animateTerminalMessage(message) {
		const targetElement = document.getElementById("terminal-message-text");
		if (!targetElement) {
			return;
		}
		targetElement.textContent = "";
		if (!message || message.trim() === "") {
			return;
		}
		const charDelay = charTime.current;
		for (let i = 0; i < message.length; i++) {
			setTimeout(() => {
				if (document.body.contains(targetElement)) {
					if (targetElement.textContent?.length === i) {
						targetElement.textContent += message[i];
					} else if (i === 0) {
						targetElement.textContent = message[i];
					}
				}
			}, charDelay * i);
		}
	}

	useEffect(() => {
		if (terminalMessage.trim() === "") {
			const targetElement = document.getElementById("terminal-message-text");
			if (targetElement) {
				targetElement.textContent = "";
			}
			const terminalCursor = document.querySelector(".terminal-cursor");
			if (terminalCursor && !isPrintingLines.current) {
				terminalCursor.classList.remove("invisible");
				console.log(
					"[useEffect terminalMessage] Cleared message and made cursor visible (printLines not running)."
				);
			} else if (terminalCursor && isPrintingLines.current) {
				console.log(
					"[useEffect terminalMessage] Cleared message, but printLines is running - cursor visibility deferred."
				);
			}
		}
	}, [terminalMessage]);

	return (
		<>
			<div className="scanlines">
				<div className="content">
					<div className="top">
						<div>Welcome to ROBCO Industries (TM) Termlink</div>
						{isLoggedIn && user && <div id="welcome-line">Welcome, </div>}
						<br />
					</div>
					<div className="main invisible">
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
								onMessageReady={handleMessageReady}
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
						<span id="terminal-message-text"></span>{" "}
						<span className="cursor terminal-cursor invisible">▇</span>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
