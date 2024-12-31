function Message(props) {
	let message;
	if (props.messageType.current == "Inbox") {
		message = props.user.messagesReceived[props.messageIndex.current];
	} else {
		message = props.user.messagesSent[props.messageIndex.current];
	}

	return (
		<>
			{props.messageType.current == "Inbox" ? (
				<div>Sender: {message.sender.username}</div>
			) : (
				<div>Receiver: {message.receiver.username}</div>
			)}
			<div>Subject: {message.title}</div>
			<div>Message: {message.body}</div>
		</>
	);
}

export default Message;
