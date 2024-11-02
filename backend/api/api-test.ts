import express, { type Request, type Response, type Router } from "express";
const project = require("../package.json");

export const apiTestRouter: Router = express.Router();

apiTestRouter.get("/", (req: Request, res: Response) => {
	res.status(200).send({
		success: true,
		message: "Successfully got a response from the API.",
		version: project.version,
	});
});
