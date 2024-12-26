import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import NavPage from "./components/NavPage";
import { useCallback, useEffect, useRef, useState } from "react";
import SendMessage from "./components/SendMessage";
import Inbox from "./components/Inbox";
import Sent from "./components/Sent";
import UserList from "./components/UserList";

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
		if (items.current[selectedItem.current].children.length > 0) {
			items.current[selectedItem.current].children[0].focus();
		}

		const content = document.querySelector(".content");
		console.log(content);
		console.log(content.childNodes);

		lines.current = [];
		lineTime.current = 0;
		getLines(content.childNodes);
		console.log(lines.current);
		printLines(lines.current);
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

	let charTime = useRef(25);
	let lineTime = useRef(0);

	function printLines(l) {
		l.forEach((line) => {
			console.log(line);

			const lineText = line.textContent;
			line.textContent = "";

			setTimeout(() => {
				for (let i = 0; i < lineText.length; i++) {
					setTimeout(() => {
						line.textContent += lineText[i];
					}, charTime.current * i);
				}
			}, lineTime.current);

			lineTime.current += charTime.current * lineText.length;
		});
		console.log(lineTime.current);

		setTimeout(() => {
			items.current[selectedItem.current].classList.add("selected");
		}, lineTime.current);
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
			}
			if (e.key === "Enter") {
				e.preventDefault();
				if (items.current[selectedItem.current].children.length > 0) {
					if (
						items.current[selectedItem.current].children[0].nodeName == "BUTTON"
					) {
						items.current[selectedItem.current].children[0].click();
					}
				}
				items.current[selectedItem.current].click();
			}
			if (e.key === "Tab") {
				e.preventDefault();
			}
		});
	}, []);

	return (
		<>
			<div className="scanlines">
				<div className="overlay"></div>
				<div className="content">
					<div>Welcome to ROBCO Industries (TM) Termlink</div>
					{isLoggedIn && <div>Welcome, {user.username}!</div>}
					<br />
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
				</div>
			</div>
		</>
	);
}

export default App;
