function Inbox(props) {
	const messages = [];
	props.user.messagesReceived.forEach((message, index) => {
		messages.push(
			<li key={index}>
				Sender: {message.sender.username} Subject: {message.title} Message:
				{message.body}
			</li>
		);
	});
	console.log(messages);

	return (
		<div>
			<ul>{messages}</ul>
		</div>
	);
}

export default Inbox;
