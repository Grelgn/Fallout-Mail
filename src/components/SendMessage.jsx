function SendMessage(props) {
	const API_URL = import.meta.env.VITE_API_URL;

	async function handleSendMessage(e) {
		e.preventDefault();
		const sender = props.user.id;
		const receiver = document.querySelector("#receiver").value;
		const title = document.querySelector("#title").value;
		const body = document.querySelector("#body").value;

		const response = await fetch(API_URL + "/message", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				sender: sender,
				receiver: receiver,
				title: title,
				body: body,
			}),
		});
		const json = await response.json();
		console.log(json);
	}

	return (
		<form action="POST">
			<ul>
				<li>
					<label htmlFor="receiver">To:</label>
					<input type="text" name="receiver" id="receiver" />
				</li>
				<li>
					<label htmlFor="title">Subject:</label>
					<input type="text" name="title" id="title" />
				</li>
				<li>
					<label htmlFor="body">Message:</label>
					<textarea name="body" id="body" />
				</li>
				<li>
					<button type="submit" onClick={handleSendMessage}>
						[Send Message]
					</button>
				</li>
			</ul>
		</form>
	);
}

export default SendMessage;
