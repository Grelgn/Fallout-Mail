import { useRef, useEffect, useState, useCallback } from "react";

function SendMessage(props) {
	const API_URL = import.meta.env.VITE_API_URL;
	const textareaRef = useRef(null);
	const resizeObserverRef = useRef(null);

	const [formData, setFormData] = useState({
		receiver: "",
		title: "",
		body: "",
	});

	const calculateTextDimensions = useCallback((text) => {
		console.log("Calculating dimensions for text length:", text.length);
		if (!textareaRef.current) {
			console.log("No textarea ref available");
			return 0;
		}

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
		measureDiv.style.width = textareaRef.current.clientWidth + "px";
		measureDiv.style.whiteSpace = "pre-wrap";

		const processedText = text.replace(/\n/g, "<br>");
		measureDiv.innerHTML = processedText || "<br>";

		document.body.appendChild(measureDiv);
		const height = measureDiv.offsetHeight;
		document.body.removeChild(measureDiv);

		console.log("Calculated height:", height);
		return height;
	}, []);

	const getMaxHeight = useCallback(() => {
		if (!textareaRef.current) return 0;
		const computedStyle = window.getComputedStyle(textareaRef.current);
		const paddingTop = parseInt(computedStyle.paddingTop);
		const paddingBottom = parseInt(computedStyle.paddingBottom);
		return textareaRef.current.clientHeight - (paddingTop + paddingBottom);
	}, []);

	const findMaxFittingText = useCallback(
		(text) => {
			if (!textareaRef.current) return text;

			const maxHeight = getMaxHeight();
			if (calculateTextDimensions(text) <= maxHeight) return text;

			// Start with the full text and remove characters until it fits
			let currentText = text;
			let start = 0;
			let end = text.length - 1;

			// First use binary search to get close to the target length
			while (start <= end) {
				const mid = Math.floor((start + end) / 2);
				const testText = text.slice(0, mid + 1);

				if (calculateTextDimensions(testText) <= maxHeight) {
					start = mid + 1;
					currentText = testText;
				} else {
					end = mid - 1;
				}
			}

			// Now add characters one by one until we find the exact cutoff point
			for (let i = currentText.length; i <= text.length; i++) {
				const testText = text.slice(0, i);
				if (calculateTextDimensions(testText) > maxHeight) {
					return text.slice(0, i - 2);
					// Slice 2 to get rid of the line-break
				}
			}

			return currentText;
		},
		[calculateTextDimensions, getMaxHeight]
	);

	const adjustTextToFit = useCallback(() => {
		console.log("adjustTextToFit called");
		if (!textareaRef.current) {
			console.log("Early return - missing textarea ref");
			return;
		}

		// Check and trim existing content if needed
		if (textareaRef.current.value) {
			const currentHeight = calculateTextDimensions(textareaRef.current.value);
			const maxHeight = getMaxHeight();

			if (currentHeight > maxHeight) {
				const fittingText = findMaxFittingText(textareaRef.current.value);
				console.log("Trimming text:", {
					currentLength: textareaRef.current.value.length,
					fittingLength: fittingText.length,
				});
				textareaRef.current.value = fittingText;
				setFormData((prev) => ({ ...prev, body: fittingText }));
			}
		}
	}, [calculateTextDimensions, findMaxFittingText, getMaxHeight]);

	const handleKeyDown = useCallback(
		(e) => {
			console.log("liHeight:", props.liHeight);
			
			console.log("KeyDown event:", e.key);
			const allowedKeys = [
				"Backspace",
				"Delete",
				"ArrowLeft",
				"ArrowRight",
				"Home",
				"End",
				"Tab",
				"F11",
				"F5",
				"Escape",
				"F12",
			];

			const isControlKey = e.ctrlKey || e.metaKey;
			const isSelectionKey =
				isControlKey && (e.key === "a" || e.key === "c" || e.key === "x");

			if (allowedKeys.includes(e.key) || isSelectionKey) {
				console.log("Allowed key press");
				return;
			}

			const maxHeight = getMaxHeight();

			// Calculate height with new character
			let newText = textareaRef.current.value;
			const selectionStart = textareaRef.current.selectionStart;
			const selectionEnd = textareaRef.current.selectionEnd;

			if (e.key === "Enter") {
				newText =
					newText.slice(0, selectionStart) + "\n" + newText.slice(selectionEnd);
			} else {
				newText =
					newText.slice(0, selectionStart) +
					e.key +
					newText.slice(selectionEnd);
			}

			const textHeight = calculateTextDimensions(newText);
			console.log("Text height check:", {
				current: textHeight,
				max: maxHeight,
				willPrevent: textHeight > maxHeight,
			});

			if (textHeight > maxHeight) {
				e.preventDefault();
			}
			if (e.key === "Enter" && textHeight > maxHeight - props.liHeight.current) {
				e.preventDefault();
			}
		},
		[calculateTextDimensions, getMaxHeight, props.liHeight]
	);

	const handlePaste = useCallback(
		(e) => {
			e.preventDefault();
			const pastedText = e.clipboardData.getData("text");
			const currentText = textareaRef.current.value;
			const selectionStart = textareaRef.current.selectionStart;
			const selectionEnd = textareaRef.current.selectionEnd;

			const newText =
				currentText.slice(0, selectionStart) +
				pastedText +
				currentText.slice(selectionEnd);

			const maxHeight = getMaxHeight();
			const textHeight = calculateTextDimensions(newText);

			if (textHeight <= maxHeight) {
				textareaRef.current.value = newText;
				setFormData((prev) => ({ ...prev, body: newText }));

				// Move cursor to after the pasted text
				const newCursorPosition = selectionStart + pastedText.length;
				textareaRef.current.setSelectionRange(
					newCursorPosition,
					newCursorPosition
				);
			}
		},
		[calculateTextDimensions, getMaxHeight]
	);

	useEffect(() => {
		console.log("Effect triggered. MessageStep:", props.messageStep);
		const textarea = textareaRef.current;
		console.log("Textarea ref:", textarea);

		if (textarea && props.messageStep === "message") {
			console.log("Setting up textarea observers and listeners");

			// Initial adjustment
			adjustTextToFit();

			// Set up resize observer
			resizeObserverRef.current = new ResizeObserver(() => {
				requestAnimationFrame(adjustTextToFit);
			});
			resizeObserverRef.current.observe(textarea);

			// Event listeners
			textarea.addEventListener("keydown", handleKeyDown);
			textarea.addEventListener("paste", handlePaste);

			return () => {
				console.log("Cleanup: Removing textarea observers and listeners");
				textarea.removeEventListener("keydown", handleKeyDown);
				textarea.removeEventListener("paste", handlePaste);
				if (resizeObserverRef.current) {
					resizeObserverRef.current.disconnect();
				}
			};
		}
	}, [adjustTextToFit, handleKeyDown, handlePaste, props.messageStep]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleProceedToMessage = (e) => {
		e.preventDefault();
		if (!formData.receiver) {
			props.terminalMessageSetter("Receiver must be specified.");
			const audio = new Audio(props.passBad);
			audio.play();
			return;
		}
		if (!formData.title) {
			props.terminalMessageSetter("Subject must be specified.");
			const audio = new Audio(props.passBad);
			audio.play();
			return;
		}
		props.messageStepSetter("message");
		props.terminalMessageSetter("");
	};

	async function handleSendMessage(e) {
		e.preventDefault();
		const sender = props.user.id;
		const { receiver, title, body } = formData;

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

			props.userList.forEach((user) => {
				if (user.id === json.data.receiverId) {
					json.data.receiver = { username: user.username };
				}
			});
			props.user.messagesSent.push(json.data);
			const audio = new Audio(props.passGood);
			audio.play();
		} else {
			if (json.errors !== undefined) {
				props.terminalMessageSetter(json.errors[0].msg + ".");
			} else {
				props.terminalMessageSetter(json.message + ".");
			}
			const audio = new Audio(props.passBad);
			audio.play();
		}
	}

	function addPage() {
		console.log("Add Page");
	}

	return (
		<form action="POST" className="send-message-form">
			<ul>
				{props.messageStep === "details" && (
					<>
						<li>
							<label htmlFor="receiver">To:</label>
							<input
								type="text"
								name="receiver"
								id="receiver"
								value={formData.receiver}
								onChange={handleInputChange}
								spellCheck="false"
							/>
						</li>
						<li>
							<label htmlFor="title">Subject:</label>
							<input
								type="text"
								name="title"
								id="title"
								value={formData.title}
								onChange={handleInputChange}
								spellCheck="false"
							/>
						</li>
						<li onClick={handleProceedToMessage}>[Proceed to message]</li>
					</>
				)}
				{props.messageStep === "message" && (
					<>
						<li className="message">
							<label htmlFor="body">Message:</label>
							<textarea
								ref={textareaRef}
								name="body"
								id="body"
								value={formData.body}
								onChange={handleInputChange}
								spellCheck="false"
							/>
						</li>
						<li onClick={addPage}>[Add page]</li>
						<li>
							<button type="submit" onClick={handleSendMessage}>
								[Send Message]
							</button>
						</li>
					</>
				)}
			</ul>
		</form>
	);
}

export default SendMessage;
