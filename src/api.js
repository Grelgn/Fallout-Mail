const API_URL = import.meta.env.VITE_API_URL;

async function apiFetch(path, options = {}) {
	try {
		const response = await fetch(API_URL + path, {
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			...options,
		});
		return await response.json();
	} catch {
		return { success: false, message: "Connection to ROBCO mainframe lost" };
	}
}

export default apiFetch;
