import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import NavPage from "./components/NavPage";
import { useCallback, useState } from "react";

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

	function select(e) {
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
				<LogIn isLoggedInSetter={isLoggedInSetter} userSetter={userSetter} />
			)}
			{page != "NavPage" && (
				<ul>
					<li id="NavPage" onClick={select}>
						Back
					</li>
				</ul>
			)}
		</>
	);
}

export default App;
