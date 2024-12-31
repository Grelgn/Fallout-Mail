function Inbox(props) {
	function goToMessage(e, i) {
		props.messageIndex.current = i;
		props.messageType.current = "Inbox";
		props.pageSetter(e.target.id);
	}

	const messages = [];
	props.user.messagesReceived.forEach((message, index) => {
		messages.push(
			<li id="Message" key={index} onClick={(e) => goToMessage(e, index)}>
				[{message.title}]
			</li>
		);
	});

	if (messages.length > 0) {
		return <ul>{messages}</ul>;
	}
}

export default Inbox;
