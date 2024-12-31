function Inbox(props) {
	function goToMessage(e, i) {
		props.messageIndex.current = i;
		props.messageType.current = "Inbox";
		props.pageSetter(e.target.id);
	}

	function nextPage() {
		props.listPageSetter(props.listPage + 1);
		document.querySelector(".selected").classList.remove("selected");
	}

	function previousPage() {
		props.listPageSetter(props.listPage - 1);
		document.querySelector(".selected").classList.remove("selected");
	}

	const messages = [];
	props.user.messagesReceived.forEach((message, index) => {
		const title = props.htmlDecode(message.title);
		messages.push(
			<li id="Message" key={index} onClick={(e) => goToMessage(e, index)}>
				[{title}]
			</li>
		);
	});

	console.log("Total Messages " + messages.length);
	const pageCount = Math.ceil(messages.length / 8);
	console.log("Page Count " + pageCount);

	let pages = [];
	for (let i = 0; i < pageCount; i++) {
		pages[i] = messages.splice(0, 8);
	}

	console.log("Pages " + pages);
	console.log("List Page " + props.listPage);

	console.log(pages[props.listPage]);

	if (pages[props.listPage].length > 0) {
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

export default Inbox;
