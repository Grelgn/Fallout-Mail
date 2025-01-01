function NavPage(props) {
	function logOut() {
		props.isLoggedInSetter(false);
	}

	return (
		<ul>
			{props.isLoggedIn ? (
				<>
					<li id="SendMessage" onClick={props.goToPage}>
						[Send a message]
					</li>
					<li id="Inbox" onClick={props.goToPage}>
						[Inbox]
					</li>
					<li id="Sent" onClick={props.goToPage}>
						[Sent]
					</li>
					<li id="UserList" onClick={props.goToPage}>
						[List of users]
					</li>
					<li id="LogOut" onClick={logOut}>
						[Log out]
					</li>
				</>
			) : (
				<>
					<li id="SignUp" onClick={props.goToPage}>
						[Sign Up]
					</li>
					<li id="LogIn" onClick={props.goToPage}>
						[Log In]
					</li>
				</>
			)}
		</ul>
	);
}

export default NavPage;
