function SignUp() {
	const API_URL = import.meta.env.VITE_API_URL;

	async function handleSignUp(e) {
		e.preventDefault();
		const username = document.querySelector("#username").value;
		const password = document.querySelector("#password").value;
		const confirm = document.querySelector("#confirm").value;
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
						<label htmlFor="confirm">Confirm password</label>
						<input type="password" name="confirm" id="confirm" />
					</li>
					<li>
						<button type="submit" onClick={handleSignUp}>
							[Sign Up]
						</button>
					</li>
				</ul>
			</form>
		</div>
	);
}

export default SignUp;
