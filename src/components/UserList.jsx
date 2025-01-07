function UserList(props) {
	function nextPage() {
		props.listPageSetter(props.listPage + 1);
		document.querySelector(".selected").classList.remove("selected");
	}

	function previousPage() {
		props.listPageSetter(props.listPage - 1);
		document.querySelector(".selected").classList.remove("selected");
	}

	const users = [];
	props.userList.forEach((user, index) => {
		const date = new Date(user.signUpDate);
		const formattedDate = props.formatDate(date);

		users.push(
			<li key={index}>
				User: {user.username} Date: {formattedDate}
			</li>
		);
	});

	const rowAmount = Math.floor((props.mainHeight - 150) / 50);
	const pageCount = Math.ceil(users.length / rowAmount);

	let pages = [];
	for (let i = 0; i < pageCount; i++) {
		pages[i] = users.splice(0, rowAmount);
	}

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

export default UserList;
