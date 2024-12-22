function UserList(props) {
	const users = [];
	props.userList.forEach((user, index) => {
		users.push(
			<li key={index}>
				User: {user.username} Date: {user.signUpDate}
			</li>
		);
	});
	console.log(users);

	return (
		<div>
			<ul>{users}</ul>
		</div>
	);
}

export default UserList;
