function LogIn(props) {
	const API_URL = import.meta.env.VITE_API_URL;

	async function handleLogIn(e) {
		e.preventDefault();
		const username = document.querySelector("#username").value;
		const password = document.querySelector("#password").value;
		const response = await fetch(API_URL + "/log-in", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
		});
		const json = await response.json();
		console.log(json);
		if (json.success) {
			console.log("Logged In");
			props.isLoggedInSetter(true);
			console.log(json.user);
			props.userSetter(json.user);
			props.userListSetter(json.userList);
		}
	}

	return (
		<form action="POST">
			<ul>
				<li>
					<label htmlFor="username">Username</label>
					<input type="text" name="username" id="username" />
				</li>
				<li>
					<label htmlFor="password">Password</label>
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
