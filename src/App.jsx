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

	function select(e) {
		setPage(e.target.id);
	}

	return (
		<>
			{page == "NavPage" && <NavPage pageSetter={pageSetter} />}
			{page == "SignUp" && <SignUp />}
			{page == "LogIn" && <LogIn />}
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
