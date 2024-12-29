import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import NavPage from "./components/NavPage";
import { useCallback, useEffect, useRef, useState } from "react";
import SendMessage from "./components/SendMessage";
import Inbox from "./components/Inbox";
import Sent from "./components/Sent";
import UserList from "./components/UserList";

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

	const [user, setUser] = useState();
	const userSetter = useCallback(
		(val) => {
			setUser(val);
		},
		[setUser]
	);

	const [userList, setUserList] = useState();
	const userListSetter = useCallback(
		(val) => {
			setUserList(val);
		},
		[setUserList]
	);

	function goToPage(e) {
		setPage(e.target.id);
	}

	let items = useRef();
	let selectedItem = useRef(0);
	let lines = useRef([]);

	// Every refresh
	useEffect(() => {
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
	});

	function getLines(n) {
		n.forEach((node) => {
			if (node.nodeName == "BR" || node.nodeName == "INPUT") {
				return;
			} else if (node.nodeName == "UL") {
				node.childNodes.forEach((li) => {
					if (li.childNodes.length > 0) {
						getLines(li.childNodes);
					} else {
						lines.current.push(li);
					}
				});
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

	function printLines(l) {
		// Excluding lines
		if (!firstLoad.current) {
			l.splice(0, 1);
		}
		if (isLoggedIn && !firstLogin.current) {
			l.splice(0, 3);
		}

		l.forEach((line) => {
			const lineText = line.textContent;
			line.textContent = "";

			setTimeout(() => {
				// Each character
				for (let i = 0; i < lineText.length; i++) {
					setTimeout(() => {
						line.textContent += lineText[i];
						// const audio = new Audio(charScroll);
						// audio.play()
					}, charTime.current * i);
				}
			}, lineTime.current);

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
		}, lineTime.current);
		firstLoad.current = false;
	}

	// Only once
	useEffect(() => {
		window.addEventListener("keydown", (e) => {
			if (e.key === "ArrowUp" && selectedItem.current > 0) {
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
				selectedItem.current < items.current.length - 1
			) {
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
			if (e.key === "Enter") {
				// e.preventDefault();
				if (items.current[selectedItem.current].children.length > 0) {
					if (
						items.current[selectedItem.current].children[0].nodeName == "BUTTON"
					) {
						items.current[selectedItem.current].children[0].click();
					}
				}
				items.current[selectedItem.current].click();
				const audio = new Audio(
					charEnter[Math.floor(Math.random() * charEnter.length)]
				);
				audio.play();
			}
			if (e.key === "Tab") {
				e.preventDefault();
			}
		});
		window.addEventListener("keyup", (e) => {
			if (
				document.activeElement.nodeName == "INPUT" ||
				document.activeElement.nodeName == "TEXTAREA"
			) {
				const audio = new Audio(
					charSingle[Math.floor(Math.random() * charSingle.length)]
				);
				audio.play();
			}
		});
	}, []);

	return (
		<>
			<div className="scanlines">
				<div className="content">
					<div>
						<div>Welcome to ROBCO Industries (TM) Termlink</div>
						{isLoggedIn && <div>Welcome, {user.username}!</div>}
						<br />
					</div>
					{page == "NavPage" && (
						<NavPage
							pageSetter={pageSetter}
							isLoggedIn={isLoggedIn}
							user={user}
							isLoggedInSetter={isLoggedInSetter}
						/>
					)}
					{page == "SignUp" && <SignUp />}
					{page == "LogIn" && (
						<LogIn
							isLoggedInSetter={isLoggedInSetter}
							userSetter={userSetter}
							userListSetter={userListSetter}
						/>
					)}
					{page == "SendMessage" && <SendMessage user={user} />}
					{page == "Inbox" && <Inbox user={user} />}
					{page == "Sent" && <Sent user={user} />}
					{page == "UserList" && <UserList userList={userList} />}
					{page != "NavPage" && (
						<ul>
							<li id="NavPage" onClick={goToPage}>
								[Go back]
							</li>
						</ul>
					)}
					<div className="end">
						> <span className="cursor">▇</span>{" "}
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
