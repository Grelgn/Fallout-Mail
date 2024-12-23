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

	useEffect(() => {
		selectedItem.current = 0;
		items.current = document.querySelectorAll("li");
		items.current[selectedItem.current].classList.add("selected");
		console.log(items.current.length);
	});

	useEffect(() => {
		console.log("event added");
		window.addEventListener("keydown", (e) => {
			if (e.key === "ArrowUp" && selectedItem.current > 0) {
				console.log("Up");
				items.current[selectedItem.current].classList.remove("selected");
				selectedItem.current -= 1;
				items.current[selectedItem.current].classList.add("selected");
				console.log(selectedItem);
			}
		});
		window.addEventListener("keydown", (e) => {
			if (
				e.key === "ArrowDown" &&
				selectedItem.current < items.current.length - 1
			) {
				console.log("Down");
				items.current[selectedItem.current].classList.remove("selected");
				selectedItem.current += 1;
				items.current[selectedItem.current].classList.add("selected");
				console.log(selectedItem);
			}
		});
		window.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				console.log("Enter");
				items.current[selectedItem.current].click();
				console.log(items.current[selectedItem.current]);
			}
		});
	}, []);

	return (
		<>
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
						Back
					</li>
				</ul>
			)}
		</>
	);
}

export default App;
