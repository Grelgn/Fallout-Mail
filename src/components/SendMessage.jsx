import { useRef, useEffect, useState, useCallback } from "react";

function SendMessage(props) {
	const API_URL = import.meta.env.VITE_API_URL;

	const textareaRef = useRef(null);
	const [maxLines, setMaxLines] = useState(null);
	const resizeObserverRef = useRef(null);

	const calculateMaxLines = useCallback(() => {
		if (!textareaRef.current || !props.liHeight.current) return;
		const textareaHeight = textareaRef.current.clientHeight;
		const newMaxLines = Math.floor(textareaHeight / props.liHeight.current - 1);
		setMaxLines(newMaxLines);
	}, [props.liHeight]);

	const calculateTextDimensions = useCallback((text) => {
		if (!textareaRef.current) return 0;

		const measureDiv = document.createElement("div");
		const computedStyle = window.getComputedStyle(textareaRef.current);

		const stylesToCopy = [
			"width",
			"fontSize",
			"fontFamily",
			"lineHeight",
			"padding",
			"border",
			"wordWrap",
			"whiteSpace",
		];

		stylesToCopy.forEach((style) => {
			measureDiv.style[style] = computedStyle[style];
		});

		measureDiv.style.position = "absolute";
		measureDiv.style.visibility = "hidden";
		measureDiv.style.height = "auto";
		measureDiv.style.whiteSpace = "pre-wrap";

		measureDiv.textContent = text;
		document.body.appendChild(measureDiv);

		const height = measureDiv.offsetHeight;
		document.body.removeChild(measureDiv);

		return height;
	}, []);

	const handleKeyDown = useCallback(
		(e) => {
			const allowedKeys = [
				"Backspace",
				"Delete",
				"ArrowLeft",
				"ArrowRight",
				"ArrowUp",
				"ArrowDown",
				"Home",
				"End",
				"Tab",
				"F11",
				"F5",
				"Escape",
			];

			const isControlKey = e.ctrlKey || e.metaKey;
			const isSelectionKey =
				isControlKey && (e.key === "a" || e.key === "c" || e.key === "x");

			if (allowedKeys.includes(e.key) || isSelectionKey) {
				return;
			}

			const textHeight = calculateTextDimensions(
				textareaRef.current.value + e.key
			);
			const maxHeight = props.liHeight.current * maxLines;

			if (textHeight > maxHeight) {
				e.preventDefault();
			}
		},
		[maxLines, calculateTextDimensions, props.liHeight]
	);

	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			resizeObserverRef.current = new ResizeObserver(calculateMaxLines);
			resizeObserverRef.current.observe(textarea);
			textarea.addEventListener("keydown", handleKeyDown);

			calculateMaxLines();

			return () => {
				textarea.removeEventListener("keydown", handleKeyDown);
				if (resizeObserverRef.current) {
					resizeObserverRef.current.disconnect();
				}
			};
		}
	}, [calculateMaxLines, handleKeyDown]);

	async function handleSendMessage(e) {
		e.preventDefault();
		const sender = props.user.id;
		const receiver = document.querySelector("#receiver").value;
		const title = document.querySelector("#title").value;
		const body = textareaRef.current.value;

		const response = await fetch(API_URL + "/message", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				sender: sender,
				receiver: receiver,
				title: title,
				body: body,
			}),
		});
		const json = await response.json();

		if (json.success) {
			props.pageSetter("NavPage");
			props.terminalMessageSetter(json.message + ".");

			// Add message data to local sent messages list
			props.userList.forEach((user) => {
				if (user.id == json.data.receiverId) {
					json.data.receiver = { username: user.username };
				}
			});
			props.user.messagesSent.push(json.data);
			const audio = new Audio(props.passGood);
			audio.play();
		} else {
			if (json.errors != undefined) {
				props.terminalMessageSetter(json.errors[0].msg + ".");
			} else {
				props.terminalMessageSetter(json.message + ".");
			}
			const audio = new Audio(props.passBad);
			audio.play();
		}
	}

	return (
		<form action="POST" className="send-message-form">
			<ul>
				<li>
					<label htmlFor="receiver">To:</label>
					<input type="text" name="receiver" id="receiver" spellCheck="false" />
				</li>
				<li>
					<label htmlFor="title">Subject:</label>
					<input type="text" name="title" id="title" spellCheck="false" />
				</li>
				<li className="message">
					<label htmlFor="body">Message:</label>
					<textarea
						ref={textareaRef}
						name="body"
						id="body"
						spellCheck="false"
					/>
				</li>
				<li>[Add page]</li>
				<li>
					<button type="submit" onClick={handleSendMessage}>
						[Send Message]
					</button>
				</li>
			</ul>
		</form>
	);
}

export default SendMessage;
