import { createStream } from "rotating-file-stream";
import config from "./config";

export default async () => {
	const stream = createStream(config.logFilename || "", {
		interval: "1d",
		maxFiles: 30,
	});
	return stream;
};
