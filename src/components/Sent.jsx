function Sent(props) {
	function goToMessage(e, i) {
		props.messageIndex.current = i;
		props.messageType.current = "Sent";
		props.pageSetter(e.target.id);
	}

	function nextPage() {
		props.listPageSetter(props.listPage + 1);
		document.querySelector(".selected")?.classList.remove("selected");
	}

	function previousPage() {
		props.listPageSetter(props.listPage - 1);
		document.querySelector(".selected")?.classList.remove("selected");
	}

	const messages = [];
	props.user.messagesSent.forEach((message, index) => {
		const title = props.htmlDecode(message.title);
		messages.push(
			<li id="Message" key={index} onClick={(e) => goToMessage(e, index)}>
				[{title}]
			</li>
		);
	});

	if (messages.length === 0) {
		return <div>No messages.</div>;
	}

	const rowAmount = Math.floor(
		(props.mainHeight - props.liHeight.current * 3) / props.liHeight.current
	);
	const pageCount = Math.ceil(messages.length / rowAmount);

	let pages = [];
	for (let i = 0; i < pageCount; i++) {
		pages[i] = messages.splice(0, rowAmount);
	}

	if (pages[props.listPage]?.length > 0) {
		return (
			<ul>
				{pages[props.listPage]}
				{props.listPage > 0 && <li onClick={previousPage}>[Previous Page]</li>}
				{props.listPage < pageCount - 1 && (
					<li onClick={nextPage}>[Next Page]</li>
				)}
			</ul>
		);
	}
}

export default Sent;
