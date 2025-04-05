import { useEffect, useRef, useState, useCallback } from "react";

function Message(props) {
	const {
		messageType,
		user,
		messageIndex,
		htmlDecode,
		formatDate,
		triggerContentUpdate,
		liHeight,
		onMessageReady,
	} = props;
	const messageDisplayRef = useRef(null);
	const [pages, setPages] = useState([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [windowHeight, setWindowHeight] = useState(window.innerHeight);

	let message;
	if (
		messageType.current == "Inbox" &&
		user?.messagesReceived?.[messageIndex.current]
	) {
		message = user.messagesReceived[messageIndex.current];
	} else if (
		messageType.current === "Sent" &&
		user?.messagesSent?.[messageIndex.current]
	) {
		message = user.messagesSent[messageIndex.current];
	} else {
		console.error(
			"Message data not found for:",
			messageType.current,
			messageIndex.current
		);
	}
	const title = htmlDecode(message.title || "");
	const body = htmlDecode(message.body || "");
	const date = new Date(message.timestamp);
	const formattedDate = formatDate(date, true);
	const fromUser =
		messageType.current === "Inbox" ? message.sender?.username : null;
	const toUser =
		messageType.current === "Sent" ? message.receiver?.username : null;

	useEffect(() => {
		const handleResize = () => setWindowHeight(window.innerHeight);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		setPages([]);
		setCurrentPage(0);

		const fromDiv = document.getElementById("message-from");
		const toDiv = document.getElementById("message-to");
		const dateDiv = document.getElementById("message-date");
		const bodyDiv = messageDisplayRef.current;
		if (fromDiv) fromDiv.textContent = "From: ";
		if (toDiv) toDiv.textContent = "To: ";
		if (dateDiv) dateDiv.textContent = "Date: ";
		if (bodyDiv) bodyDiv.textContent = "";

		if (!messageDisplayRef.current || !liHeight.current) return;

		let measureDiv;
		try {
			const maxHeight = windowHeight - liHeight.current * 11 + 40;
			const styles = window.getComputedStyle(messageDisplayRef.current);

			measureDiv = document.createElement("div");
			measureDiv.style.cssText = `
                width: ${styles.width};
                font: ${styles.font};
                line-height: ${styles.lineHeight};
                padding: ${styles.padding};
                white-space: ${styles.whiteSpace};
                word-wrap: ${styles.wordWrap};
                visibility: hidden;
                position: absolute;
                top: -9999px;
            `;
			document.body.appendChild(measureDiv);

			let remainingText = body;
			const newPages = [];

			if (body.trim() === "") {
				newPages.push("");
			} else {
				while (remainingText.length > 0) {
					let low = 0,
						high = remainingText.length,
						bestFit = "";
					while (low <= high) {
						const mid = Math.floor((low + high) / 2);
						const testText = remainingText.substring(0, mid);
						measureDiv.textContent = testText;
						if (measureDiv.offsetHeight <= maxHeight) {
							bestFit = testText;
							low = mid + 1;
						} else {
							high = mid - 1;
						}
					}
					bestFit = bestFit || remainingText.substring(0, 1);
					if (bestFit) {
						newPages.push(bestFit);
					} else {
						console.error("Message pagination failed to find best fit.");
						newPages.push(remainingText.substring(0, 100));
						remainingText = remainingText.substring(100);
						break;
					}
					remainingText = remainingText.substring(bestFit.length);
				}
			}

			setPages(newPages);
			setCurrentPage(0);

			requestAnimationFrame(() => {
				const firstPageContent = newPages[0] || "";

				const messageContentData = {
					from: fromUser ? `From: ${fromUser}` : null,
					to: toUser ? `To: ${toUser}` : null,
					date: `Date: ${formattedDate}`,
					bodyPage: firstPageContent,
				};

				setPages(newPages);
				setCurrentPage(0);

				console.log(
					"[Message.jsx] Calling onMessageReady with data:",
					messageContentData
				);
				onMessageReady(messageContentData);
			});
		} catch (error) {
			requestAnimationFrame(() => {
				const errorData = {
					from: fromUser ? `From: ${fromUser}` : null,
					to: toUser ? `To: ${toUser}` : null,
					date: `Date: ${formattedDate}`,
					bodyPage: `[Error loading message body: ${
						error?.message || "Unknown error"
					}]`,
				};
				onMessageReady(errorData);
			});
		} finally {
			if (measureDiv && document.body.contains(measureDiv)) {
				document.body.removeChild(measureDiv);
			}
		}
	}, [
		body,
		fromUser,
		toUser,
		formattedDate,
		windowHeight,
		liHeight,
		onMessageReady,
		messageDisplayRef,
	]);

	const handleNextPage = () => {
		if (currentPage < pages.length - 1) {
			const nextPage = currentPage + 1;
			setCurrentPage(nextPage);
			const updatedPageData = { bodyPage: pages[nextPage] || "" };
			triggerContentUpdate(updatedPageData);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 0) {
			const prevPage = currentPage - 1;
			setCurrentPage(prevPage);
			const updatedPageData = { bodyPage: pages[prevPage] || "" };
			triggerContentUpdate(updatedPageData);
		}
	};

	return (
		<>
			{messageType.current == "Inbox" ? (
				<div id="message-from"></div>
			) : (
				<div id="message-to"></div>
			)}
			<div id="message-date"></div>
			<br />
			<div className="message-display" ref={messageDisplayRef}></div>
			<ul>
				{currentPage < pages.length - 1 && (
					<li className="pagination-item" onClick={handleNextPage}>
						[Next Page]
					</li>
				)}
				{currentPage > 0 && (
					<li className="pagination-item" onClick={handlePrevPage}>
						[Previous Page]
					</li>
				)}
			</ul>
		</>
	);
}

export default Message;
