import { useRef, useEffect, useState, useCallback } from "react";
import apiFetch from "../api";

function SendMessage(props) {
	const textareaRef = useRef(null);
	const resizeObserverRef = useRef(null);
	const [maxLines, setMaxLines] = useState(null);

	const [formData, setFormData] = useState({
		receiver: "",
		title: "",
		body: "",
	});

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

	const findMaxFittingText = useCallback(
		(text) => {
			if (!textareaRef.current || !props.liHeight.current) return text;

			const maxHeight = textareaRef.current.clientHeight;
			let processedText = text.replace(/\n$/, "");
			if (calculateTextDimensions(text) <= maxHeight) return processedText;

			let left = 0;
			let right = text.length;
			let result = "";

			while (left <= right) {
				const mid = Math.floor((left + right) / 2);
				const testText = text.slice(0, mid);

				if (calculateTextDimensions(testText) <= maxHeight) {
					result = testText;
					left = mid + 1;
				} else {
					right = mid - 1;
				}
			}

			return result;
		},
		[calculateTextDimensions, props.liHeight]
	);

	const calculateMaxLines = useCallback(() => {
		if (!textareaRef.current || !props.liHeight.current) return;

		const textareaHeight = textareaRef.current.clientHeight;
		const newMaxLines = Math.floor(textareaHeight / props.liHeight.current);

		setMaxLines(newMaxLines);

		const currentText = textareaRef.current.value;
		let fittingText = findMaxFittingText(currentText);

		// Remove trailing newline if it exists
		if (fittingText.endsWith("\n")) {
			fittingText = fittingText.slice(0, -1);
		}

		if (fittingText !== currentText) {
			textareaRef.current.value = fittingText;
			setFormData((prev) => ({ ...prev, body: fittingText }));
		}
	}, [props.liHeight, findMaxFittingText]);

	const handleKeyDown = useCallback(
		(e) => {
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

			if (allowedKeys.includes(e.key) || isSelectionKey) return;

			const textHeight = calculateTextDimensions(
				textareaRef.current.value + e.key
			);
			const maxHeight = props.liHeight.current * maxLines;

			if (textHeight > maxHeight) {
				e.preventDefault();
			}

			if (
				e.key === "Enter" &&
				textHeight > maxHeight - props.liHeight.current
			) {
				e.preventDefault();
			}
		},
		[maxLines, calculateTextDimensions, props.liHeight]
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

			const textHeight = calculateTextDimensions(newText);
			const maxHeight = props.liHeight.current * maxLines;

			if (textHeight <= maxHeight) {
				textareaRef.current.value = newText;
				setFormData((prev) => ({ ...prev, body: newText }));
				const newCursorPosition = selectionStart + pastedText.length;
				textareaRef.current.setSelectionRange(
					newCursorPosition,
					newCursorPosition
				);
			}
		},
		[calculateTextDimensions, maxLines, props.liHeight]
	);

	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea && props.messageStep === "message") {
			resizeObserverRef.current = new ResizeObserver(calculateMaxLines);
			resizeObserverRef.current.observe(textarea);
			textarea.addEventListener("keydown", handleKeyDown);
			textarea.addEventListener("paste", handlePaste);
			calculateMaxLines();

			return () => {
				textarea.removeEventListener("keydown", handleKeyDown);
				textarea.removeEventListener("paste", handlePaste);
				if (resizeObserverRef.current) {
					resizeObserverRef.current.disconnect();
				}
			};
		}
	}, [
		calculateMaxLines,
		handleKeyDown,
		handlePaste,
		props.messageStep,
		props.resized,
	]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleProceedToMessage = (e) => {
		e.preventDefault();
		if (!formData.receiver) {
			props.terminalMessageSetter("Receiver must be specified.");
			new Audio(props.passBad).play();
			return;
		}
		if (!formData.title) {
			props.terminalMessageSetter("Subject must be specified.");
			new Audio(props.passBad).play();
			return;
		}
		props.messageStepSetter("message");
		props.terminalMessageSetter("");
	};

	async function handleSendMessage(e) {
		e.preventDefault();
		const { receiver, title, body } = formData;
		const json = await apiFetch("/message", {
			method: "POST",
			body: JSON.stringify({ receiver, title, body }),
		});
		if (json.success) {
			props.pageSetter("NavPage");
			props.terminalMessageSetter(json.message + ".");
			new Audio(props.passGood).play();
		} else {
			props.terminalMessageSetter(
				(json.errors?.[0]?.msg || json.message) + "."
			);
			new Audio(props.passBad).play();
		}
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
