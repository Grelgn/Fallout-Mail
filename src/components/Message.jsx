function Message(props) {
	let message;
	if (props.messageType.current == "Inbox") {
		message = props.user.messagesReceived[props.messageIndex.current];
	} else {
		message = props.user.messagesSent[props.messageIndex.current];
	}

	const title = props.htmlDecode(message.title);
	const body = props.htmlDecode(message.body);
	console.log(message);
	const date = new Date(message.timestamp);
	const formattedDate = props.formatDate(date, true);

	return (
		<>
			{props.messageType.current == "Inbox" ? (
				<div>From: {message.sender.username}</div>
			) : (
				<div>To: {message.receiver.username}</div>
			)}
			<span>{title}</span>
			<div>{formattedDate}</div>
			<br />
			<div className="message-display">{body}</div>
			<ul>
				<li>[Next Page]</li>
			</ul>
		</>
	);
}

export default Message;
