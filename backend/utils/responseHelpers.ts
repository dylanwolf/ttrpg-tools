import { type Response } from "express";
import HttpStatus from "http-status-codes";

export function sendArgumentError(res: Response, message: string) {
	res.status(HttpStatus.BAD_REQUEST).send({
		success: false,
		message: message,
	});
}

export function sendOKResult(res: Response, message: string, result: any) {
	res.status(HttpStatus.OK).send({
		success: true,
		message: message,
		...result,
	});
}
