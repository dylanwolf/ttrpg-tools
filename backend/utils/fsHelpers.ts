import fs from "fs";

export function readFileAsync(filename: string): Promise<string | Uint8Array> {
	return new Promise<string | Uint8Array>((resolve, reject) => {
		fs.readFile(filename, (err, bytes) => {
			if (err) {
				reject(err);
			} else {
				resolve(bytes);
			}
		});
	});
}
