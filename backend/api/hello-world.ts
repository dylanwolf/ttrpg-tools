import express, { type Request, type Response, type Router } from "express";

export const helloWorldRouter: Router = express.Router();

helloWorldRouter.get("/", (req: Request, res: Response) => {
	res.status(200).send({
		success: true,
		message: "Hello world!",
	});
});
