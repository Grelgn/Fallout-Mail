function NavPage(props) {
	function goToPage(e) {
		props.pageSetter(e.target.id);
	}

	function logOut() {
		props.isLoggedInSetter(false);
		console.log("Logged Out");
	}

	return (
		<div>
			{props.isLoggedIn ? (
				<ul>
					Hello {props.user.username}
					<li>Inbox</li>
					<li id="SendMessage" onClick={goToPage}>Send a message</li>
					<li>List of users</li>
					<li onClick={logOut}>Log out</li>
				</ul>
			) : (
				<ul>
					<li id="SignUp" onClick={goToPage}>
						Sign Up
					</li>
					<li id="LogIn" onClick={goToPage}>
						Log In
					</li>
				</ul>
			)}
		</div>
	);
}

export default NavPage;
