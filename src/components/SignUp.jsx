function SignUp() {
	const API_URL = import.meta.env.VITE_API_URL;

	async function handleSignUp() {
		const response = await fetch(API_URL + "/sign-up", {
			method: "POST",
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
				<button type="button" onClick={handleSignUp}>
					Sign Up
				</button>
			</form>
		</div>
	);
}

export default SignUp;
