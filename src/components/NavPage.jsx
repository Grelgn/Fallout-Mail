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
					<li id="SendMessage" onClick={goToPage}>
						[Send a message]
					</li>
					<li id="Inbox" onClick={goToPage}>
						[Inbox]
					</li>
					<li id="Sent" onClick={goToPage}>
						[Sent]
					</li>
					<li id="UserList" onClick={goToPage}>
						[List of users]
					</li>
					<li id="LogOut" onClick={logOut}>[Log out]</li>
				</ul>
			) : (
				<ul>
					<li id="SignUp" onClick={goToPage}>
						[Sign Up]
					</li>
					<li id="LogIn" onClick={goToPage}>
						[Log In]
					</li>
				</ul>
			)}
		</div>
	);
}

export default NavPage;
