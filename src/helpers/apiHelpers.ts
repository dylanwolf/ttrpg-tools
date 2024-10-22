import { openMessageWindow } from "../state/modal-ui/ModalUI";

export function localApiCall(url: string, params: any) {
	const fullUrl = `/api${url}`;
	return fetch(fullUrl, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(params || {}),
	})
		.then((res) => res.json())
		.catch((ex) => {
			console.log(ex);
			openMessageWindow({
				Title: "API Call Failed",
				Message: ex,
			});
		});
}

export function downloadAsPdf(filename: string, base64Data: string) {
	if (!base64Data) return;

	const dataUrl = `data:application/pdf;base64,${base64Data}`;

	const link = document.createElement("a");
	link.href = dataUrl;
	link.download = filename;
	document.body.appendChild(link);
	link.click();

	document.body.removeChild(link);
}
