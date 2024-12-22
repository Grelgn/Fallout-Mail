import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import NavPage from "./components/NavPage";
import { useCallback, useState } from "react";
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
