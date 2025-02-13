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

	// Every page change
	useEffect(() => {
		renderLines();
	}, [page, listPage, isLoggedIn, terminalMessage, messageStep]);

	function renderLines() {
		const selected = document.querySelector(".selected");
		if (selected) selected.classList.remove("selected");

		selectedItem.current = 0;
		items.current = document.querySelectorAll("li");

		const content = document.querySelector(".content");

		lines.current = [];
		lineTime.current = 0;
		getLines(content.childNodes);
		printLines(lines.current);

		const audio = new Audio(
			hardDrive[Math.floor(Math.random() * hardDrive.length)]
		);
		audio.play();
	}

	function getLines(n) {
		n.forEach((node) => {
			if (node.nodeName == "BR" || node.className == "arrow") {
				return;
			} else if (node.nodeName == "UL") {
				node.childNodes.forEach((li) => {
					if (li.childNodes.length > 0) {
						getLines(li.childNodes);
					} else {
						lines.current.push(li);
					}
				});
			} else if (node.nodeName == "TEXTAREA") {
				lines.current.push(node);
			} else if (node.childNodes.length > 0) {
				getLines(node.childNodes);
			} else {
				lines.current.push(node);
			}
		});
	}

	let charTime = useRef(10);
	let lineTime = useRef(0);
	let firstLoad = useRef(true);
	let firstLogin = useRef(true);

	useEffect(() => {
		isLoggedIn ? (firstLogin.current = false) : (firstLogin.current = true);
	}, [isLoggedIn]);

	const isPrintingLines = useRef(false);

	function printLines(l) {
		const realCursor = document.querySelector(".cursor");
		isPrintingLines.current = true;
		// Excluding lines
		if (!firstLoad.current) {
			l.splice(0, 1);
		}
		if (isLoggedIn && !firstLogin.current) {
			l.splice(0, 3);
		}

		l.forEach((line) => {
			//Cursor
			const cursor = document.createElement("span");
			cursor.textContent = "▇";
			cursor.classList.add("cursor");
			cursor.style.animationDelay = -lineTime.current + "ms";

			let lineText;
			if (line.nodeName == "INPUT") {
				lineText = line.value;
				line.value = "";

				setTimeout(() => {
					// Each character
					for (let i = 0; i < lineText.length; i++) {
						setTimeout(() => {
							line.value += lineText[i];
						}, charTime.current * i);
					}
				}, lineTime.current);
			} else if (line.nodeName == "TEXTAREA") {
				lineText = line.value;
				line.classList.add("invisible");

				setTimeout(() => {
					line.value = "";
					line.classList.remove("invisible");
					// Each character
					for (let i = 0; i < lineText.length; i++) {
						setTimeout(() => {
							line.value += lineText[i];
						}, charTime.current * i);
					}
				}, lineTime.current);
			} else {
				lineText = line.textContent;
				line.textContent = "";

				setTimeout(() => {
					if (!line.parentNode.contains(realCursor)) {
						line.parentNode.appendChild(cursor);
					}
					// Each character
					for (let i = 0; i < lineText.length; i++) {
						setTimeout(() => {
							line.textContent += lineText[i];
						}, charTime.current * i);
					}
				}, lineTime.current);
			}

			setTimeout(() => {
				cursor.remove();
			}, lineTime.current + charTime.current * lineText.length);

			lineTime.current += charTime.current * lineText.length;
		});

		const audio = new Audio(charScroll);
		const interval = setInterval(() => {
			audio.play();
		}, 0);

		// When printing is done
		setTimeout(() => {
			items.current[selectedItem.current].classList.add("selected");
			clearInterval(interval);
			const audio = new Audio(
				charSingle[Math.floor(Math.random() * charSingle.length)]
			);
			audio.play();
			if (items.current[selectedItem.current].children.length > 0) {
				items.current[selectedItem.current].children[0].focus();
			}
			isPrintingLines.current = false;
		}, lineTime.current);
		firstLoad.current = false;
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
						<span className="arrow">></span> {terminalMessage}{" "}
						<span className="cursor">▇</span>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
