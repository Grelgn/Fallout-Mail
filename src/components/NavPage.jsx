function NavPage(props) {

  function select(e) {
		props.pageSetter(e.target.id);
	}

	return (
		<div>
			{/* Not logged in */}
			<ul>
				<li id="SignUp" onClick={select}>Sign Up</li>
				<li id="LogIn" onClick={select}>Log In</li>
			</ul>
			{/* Logged in */}
			<ul>
				<li>Inbox</li>
				<li>Send a message</li>
				<li>List of users</li>
				<li>Log out</li>
			</ul>
		</div>
	);
}

export default NavPage;
