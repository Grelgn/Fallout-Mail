function Message(props) {
	let message;
	if (props.messageType.current == "Inbox") {
		message = props.user.messagesReceived[props.messageIndex.current];
	} else {
		message = props.user.messagesSent[props.messageIndex.current];
	}

	const title = props.htmlDecode(message.title);
	const body = props.htmlDecode(message.body);

	return (
		<>
			{/* {props.messageType.current == "Inbox" ? (
				<div>Sender: {message.sender.username}</div>
			) : (
				<div>Receiver: {message.receiver.username}</div>
			)} */}
			{/* <span>Subject: {title}</span> */}
			<div className="message-display">{body}</div>
			<ul>
				<li>[Next Page]</li>
			</ul>
		</>
	);
}

export default Message;
