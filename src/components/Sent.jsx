function Sent(props) {
	function goToMessage(e, i) {
		props.messageIndex.current = i;
		props.messageType.current = "Sent";
		props.pageSetter(e.target.id);
	}

	const messages = [];
	props.user.messagesSent.forEach((message, index) => {
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

export default Sent;
