import express, { type Request } from "express";
import { logger } from "./logger";
import pinoHttp from "pino-http";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./config";
import { AddressInfo } from "net";

const app = express();
app.use(pinoHttp({ logger: logger, useLevel: "trace" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(
	rateLimit({
		legacyHeaders: true,
		limit: config.rateLimitRequests,
		message: "Too many requests",
		standardHeaders: true,
		windowMs: config.rateLimitRequests,
		keyGenerator: (req: Request) => req.ip as string,
	})
);

// Start server
const server = app.listen(config.port, () => {
	var addrInfo = server.address() as AddressInfo;
	console.log(`Listening on http://${addrInfo.address}:${addrInfo.port}`);
});

const onCloseSignal = () => {
	server.close(() => process.exit());
	setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);

export default app;
