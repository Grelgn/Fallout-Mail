function Sent(props) {
	const messages = [];
	props.user.messagesSent.forEach((message, index) => {
		messages.push(
			<li key={index}>
				To: {message.receiver.username} Subject: {message.title} Message:
				{message.body}
			</li>
		);
	});
	console.log(messages);

	return <ul>{messages}</ul>;
}

export default Sent;
