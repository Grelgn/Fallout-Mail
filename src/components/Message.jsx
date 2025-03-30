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
	if (messageType.current == "Inbox") {
		message = user.messagesReceived[messageIndex.current];
	} else {
		message = user.messagesSent[messageIndex.current];
	}

	const title = htmlDecode(message.title);
	const body = htmlDecode(message.body);
	const date = new Date(message.timestamp);
	const formattedDate = formatDate(date, true);

	useEffect(() => {
		const handleResize = () => setWindowHeight(window.innerHeight);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
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

			setPages(newPages);
			setCurrentPage(0);
			onMessageReady();
		} catch (error) {
			console.error("Error calculating message pages:", error);
			setPages([body]);
			setCurrentPage(0);
			onMessageReady();
		} finally {
			if (measureDiv && document.body.contains(measureDiv)) {
				document.body.removeChild(measureDiv);
			}
		}
	}, [
		body,
		windowHeight,
		liHeight,
		triggerContentUpdate,
		onMessageReady,
		messageDisplayRef,
	]);

	const handleNextPage = () => {
		if (currentPage < pages.length - 1) {
			setCurrentPage((p) => p + 1);
			triggerContentUpdate();
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 0) {
			setCurrentPage((p) => p - 1);
			triggerContentUpdate();
		}
	};

	return (
		<>
			{messageType.current == "Inbox" ? (
				<div>From: {message.sender.username}</div>
			) : (
				<div>To: {message.receiver.username}</div>
			)}
			<div>Date: {formattedDate}</div>
			<br />
			<div className="message-display" ref={messageDisplayRef}>
				{pages.length > 0 ? pages[currentPage] : ""}
			</div>
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
