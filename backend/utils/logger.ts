import pino, { Logger } from "pino";
import config from "./config";
import { createStream } from "rotating-file-stream";

export type LoggerType = Logger<never, boolean>;

var logger: Logger<never, boolean>;

if (config.logFilename) {
	logger = pino({
		level: config.logLevel,
		transport: {
			target: "./logFileStream",
		},
	});
} else {
	logger = pino({
		level: config.logLevel,
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
			},
		},
	});
}

export { logger };
