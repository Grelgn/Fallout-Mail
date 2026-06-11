import apiFetch from "../api";

function LogIn(props) {
	async function handleLogIn(e) {
		e.preventDefault();
		const username = document.querySelector("#username");
		const password = document.querySelector("#password");
		const json = await apiFetch("/log-in", {
			method: "POST",
			body: JSON.stringify({
				username: username.value,
				password: password.value,
			}),
		});
		if (json.success) {
			props.isLoggedInSetter(true);
			props.userSetter(json.user);
			props.userListSetter(json.userList);
			props.terminalMessageSetter(json.message + ".");
			const audio = new Audio(props.passGood);
			audio.play();
		} else {
			props.terminalMessageSetter(json.message + ".");
			username.value = "";
			password.value = "";
			document.querySelector(".selected")?.classList.remove("selected");
			const audio = new Audio(props.passBad);
			audio.play();
		}
		setInitialScale();
	}

	function setInitialScale() {
		const li = document.querySelector("li").clientHeight;
		props.liHeight.current = li;
		props.mainMargin.current = li * 5 + 20 + 20;
		const windowHeight = window.innerHeight;
		const height = windowHeight - props.mainMargin.current;
		props.mainHeightSetter(height);
	}

	return (
		<form action="POST">
			<ul>
				<li>
					<label htmlFor="username">Username:</label>
					<input type="text" name="username" id="username" spellCheck="false" />
				</li>
				<li>
					<label htmlFor="password">Password:</label>
					<input type="password" name="password" id="password" />
				</li>
				<li>
					<button type="submit" onClick={handleLogIn}>
						[Log In]
					</button>
				</li>
			</ul>
		</form>
	);
}

export default LogIn;
