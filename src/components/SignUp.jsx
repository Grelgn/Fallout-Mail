function SignUp(props) {
	const API_URL = import.meta.env.VITE_API_URL;

	async function handleSignUp(e) {
		e.preventDefault();
		const username = document.querySelector("#username");
		const password = document.querySelector("#password");
		const confirm = document.querySelector("#confirm");
		const response = await fetch(API_URL + "/sign-up", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username.value,
				password: password.value,
				confirm: confirm.value,
			}),
		});
		const json = await response.json();
		console.log(json);
		if (json.success) {
			props.pageSetter("NavPage");
			props.terminalMessageSetter(json.message + ".");
			const audio = new Audio(props.passGood);
			audio.play()
		} else {
			username.value = "";
			password.value = "";
			confirm.value = "";
			if (json.errors != undefined) {
				props.terminalMessageSetter(json.errors[0].msg + ".");
			} else {
				props.terminalMessageSetter(json.message + ".");
			}
			const audio = new Audio(props.passBad);
			audio.play()
		}
		document.querySelector(".selected").classList.remove("selected");
	}

	return (
		<form action="POST">
			<ul>
				<li>
					<label htmlFor="username">Username:</label>
					<input type="text" name="username" id="username" />
				</li>
				<li>
					<label htmlFor="password">Password:</label>
					<input type="password" name="password" id="password" />
				</li>
				<li>
					<label htmlFor="confirm">Confirm password:</label>
					<input type="password" name="confirm" id="confirm" />
				</li>
				<li>
					<button type="submit" onClick={handleSignUp}>
						[Sign Up]
					</button>
				</li>
			</ul>
		</form>
	);
}

export default SignUp;
