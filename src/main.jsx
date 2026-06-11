import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import SystemFailure from "./components/SystemFailure.jsx";

createRoot(document.getElementById("root")).render(
	<SystemFailure>
		<App />
	</SystemFailure>
);
