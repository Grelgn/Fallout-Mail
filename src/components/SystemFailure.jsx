import { Component } from "react";

class SystemFailure extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="scanlines">
					<div className="content">
						<div className="top">
							<div>Welcome to ROBCO Industries (TM) Termlink</div>
							<br />
						</div>
						<div className="main">
							<div>SYSTEM FAILURE</div>
							<br />
							<ul>
								<li
									className="selected"
									onClick={() => window.location.reload()}
								>
									[Reboot terminal]
								</li>
							</ul>
						</div>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}

export default SystemFailure;
