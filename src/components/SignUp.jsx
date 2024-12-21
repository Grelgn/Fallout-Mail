function SignUp() {
	const API_URL = import.meta.env.VITE_API_URL;

	async function handleSignUp(e) {
		e.preventDefault();
		const username = e.target.parentNode[0].value;
		const password = e.target.parentNode[1].value;
		const confirm = e.target.parentNode[2].value;
		const response = await fetch(API_URL + "/sign-up", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username,
				password: password,
				confirm: confirm,
			}),
		});
		const json = await response.json();
		console.log(json);
	}

	return (
		<div>
			<form action="POST">
				<label htmlFor="username">Username</label>
				<input type="text" name="username" id="username" />
				<label htmlFor="password">Password</label>
				<input type="password" name="password" id="password" />
				<label htmlFor="confirm">Confirm password</label>
				<input type="password" name="confirm" id="confirm" />
				<button type="submit" onClick={handleSignUp}>
					Sign Up
				</button>
			</form>
		</div>
	);
}

export default SignUp;
