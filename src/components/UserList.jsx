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

	return <ul>{users}</ul>;
}

export default UserList;
