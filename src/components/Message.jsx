function Message(props) {
	return (
		<>
			<div>Sender: {props.message.sender.username}</div>
			<div>Subject: {props.message.title}</div>
			<div>Message: {props.message.body}</div>
		</>
	);
}

export default Message;
