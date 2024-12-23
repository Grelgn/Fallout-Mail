function SendMessage(props) {
	const API_URL = import.meta.env.VITE_API_URL;

	async function handleSendMessage(e) {
		e.preventDefault();
		const sender = props.user.id;
		const receiver = e.target.parentNode[0].value;
		const title = e.target.parentNode[1].value;
		const body = e.target.parentNode[2].value;

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
		<div>
			<form action="POST">
				<label htmlFor="receiver">To:</label>
				<input type="text" name="receiver" id="receiver" />
				<label htmlFor="title">Subject:</label>
				<input type="text" name="title" id="title" />
				<label htmlFor="body">Message:</label>
				<textarea name="body" id="body" />
				<button type="submit" onClick={handleSendMessage}>
					Send Message
				</button>
			</form>
		</div>
	);
}

export default SendMessage;
