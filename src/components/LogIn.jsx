function LogIn() {
	const API_URL = import.meta.env.VITE_API_URL;

	async function handleLogIn() {
		const response = await fetch(API_URL + "/log-in", {
			method: "POST",
		});
		const json = await response.json();
		console.log(json);
	}

	return (
		<form action="POST">
			<label htmlFor="username">Username</label>
			<input type="text" name="username" id="username" />
			<label htmlFor="password">Password</label>
			<input type="password" name="password" id="password" />
			<button type="button" onClick={handleLogIn}>
				Log In
			</button>
		</form>
	);
}

export default LogIn;
