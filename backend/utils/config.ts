import dotenv from "dotenv";
dotenv.config();

function configToNumber(txt: string | undefined, defaultValue: number) {
	if (txt === undefined) return defaultValue;

	var numberValue = parseInt(txt);
	return isNaN(numberValue) ? defaultValue : numberValue;
}

export default {
	port: process.env.PORT || 4000,
	rateLimitWindow: configToNumber(process.env.RATE_LIMIT_WINDOW_MS, 1000),
	rateLimitRequests: configToNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 20),
	logFilename: process.env.LOG_FILENAME,
	logLevel: process.env.LOG_LEVEL || "trace",
};
