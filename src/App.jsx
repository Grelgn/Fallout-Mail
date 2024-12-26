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

	// Every refresh
	useEffect(() => {
		selectedItem.current = 0;
		items.current = document.querySelectorAll("li");
		items.current[selectedItem.current].classList.add("selected");
		if (items.current[selectedItem.current].children.length > 0) {
			console.log("Has Children");
			items.current[selectedItem.current].children[0].focus();
		}
		console.log(items.current.length);

		const overlay = document.querySelector(".overlay");
		const lines = document.body.clientHeight / 50;
		console.log(lines)
		let divs = [];
		for (let i = 0; i < lines; ++i) {
			divs[i] = document.createElement("div");
		}
		overlay.replaceChildren(...divs);
	});

	// Only once
	useEffect(() => {
		console.log("event added");
		window.addEventListener("keydown", (e) => {
			if (e.key === "ArrowUp" && selectedItem.current > 0) {
				console.log("Up");
				items.current[selectedItem.current].classList.remove("selected");
				selectedItem.current -= 1;
				items.current[selectedItem.current].classList.add("selected");
				if (items.current[selectedItem.current].children.length > 0) {
					console.log("Has Children");
					items.current[selectedItem.current].children[0].focus();
				}
				console.log(selectedItem);
			}
			if (
				e.key === "ArrowDown" &&
				selectedItem.current < items.current.length - 1
			) {
				console.log("Down");
				items.current[selectedItem.current].classList.remove("selected");
				selectedItem.current += 1;
				items.current[selectedItem.current].classList.add("selected");
				if (items.current[selectedItem.current].children.length > 0) {
					console.log("Has Children");
					items.current[selectedItem.current].children[0].focus();
				}
				console.log(selectedItem);
			}
			if (e.key === "Enter") {
				e.preventDefault();
				console.log("Enter");
				if (items.current[selectedItem.current].children.length > 0) {
					console.log("Has Children");
					if (
						items.current[selectedItem.current].children[0].nodeName == "BUTTON"
					) {
						console.log("BUTTON");
						items.current[selectedItem.current].children[0].click();
					}
				}
				items.current[selectedItem.current].click();
				console.log(items.current);
			}
			if (e.key === "Tab") {
				e.preventDefault();
			}
		});

		// Overlay
		// const overlay = document.querySelector(".overlay");
		// const lines = document.body.clientHeight / 50;
		// for (let i = 0; i < lines; ++i) {
		// 	overlay.appendChild(document.createElement("div"));
		// }
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
