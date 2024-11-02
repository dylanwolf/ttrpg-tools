import express, { type Request } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import { AddressInfo } from "net";
import { rateLimit } from "express-rate-limit";
import { configToNumber } from "./utils/envHelpers";
import { apiTestRouter } from "./api/api-test";
import { pdfFormFillRouter } from "./api/pdf-form-fill";

// Configuration
const port = process.env.PORT || 4000;
const rateLimitWindow = configToNumber(process.env.RATE_LIMIT_WINDOW_MS, 1000);
const rateLimitRequests = configToNumber(
	process.env.RATE_LIMIT_MAX_REQUESTS,
	20
);

// Build app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(
	rateLimit({
		legacyHeaders: true,
		limit: rateLimitRequests,
		message: "Too many requests",
		standardHeaders: true,
		windowMs: rateLimitWindow,
		keyGenerator: (req: Request) => req.ip as string,
	})
);

// Build API
app.use("/api-test", apiTestRouter);
app.use("/pdf-form-fill", pdfFormFillRouter);

// Start server
const server = app.listen(port, () => {
	var addrInfo = server.address() as AddressInfo;
	console.log(`Listening on http://${addrInfo.address}:${addrInfo.port}`);
});

const onCloseSignal = () => {
	server.close(() => process.exit());
	setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
