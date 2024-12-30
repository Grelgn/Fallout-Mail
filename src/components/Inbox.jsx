function Inbox(props) {
	function goToMessage(e, i) {
		props.messageIndex.current = i;
		props.pageSetter(e.target.id);
	}

	const messages = [];
	props.user.messagesReceived.forEach((message, index) => {
		messages.push(
			<li id="Message" key={index} onClick={(e) => goToMessage(e, index)}>
				Sender: {message.sender.username} Subject: {message.title}
			</li>
		);
	});

	return <ul>{messages}</ul>;
}

export default Inbox;
