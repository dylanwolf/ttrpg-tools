import express, { type Request, type Response, type Router } from "express";
import path from "path";
import fs from "fs";
import { sendArgumentError, sendOKResult } from "../utils/responseHelpers";
import { isValidBuilderKey } from "../utils/appHelpers";
import { readFileAsync } from "../utils/fsHelpers";
import { PDFDocument, PDFTextField } from "pdf-lib";
import { encode as base64encode } from "base64-arraybuffer";
import { IApiResult } from "../baseClasses";

export const pdfFormFillRouter: Router = express.Router();

function buildTemplateFilename(builderKey: string) {
	return path.resolve(`pdf-form-fills/${builderKey}.pdf`);
}

function doesTemplateExist(builderKey: string) {
	return fs.existsSync(buildTemplateFilename(builderKey));
}

interface FormFillResult extends IApiResult {
	missingFields?: string[] | undefined;
	pdfBytes?: Uint8Array | undefined;
}

async function formFillTemplate(
	builderKey: string,
	paramsArg: any
): Promise<FormFillResult> {
	const filename = buildTemplateFilename(builderKey);

	const bytes = await readFileAsync(filename);
	const pdfDoc = await PDFDocument.load(bytes);
	const form = pdfDoc.getForm();
	const allFields = form.getFields();

	var missingFields: string[] = [];

	try {
		Object.keys(paramsArg).forEach((key) => {
			const value = paramsArg[key];
			if (!value) return;

			const field = allFields.filter((f) => f.getName() === key)[0];

			if (!field) {
				missingFields.push(key);
				return;
			}

			if (!(field as PDFTextField).setText) {
				missingFields.push(key);
				return;
			}

			//(field as PDFTextField).setText(value);
			(field as PDFTextField).setText(value?.toString() || "");
		});

		return {
			success: true,
			missingFields: missingFields,
			pdfBytes: await pdfDoc.save(),
		};
	} catch (ex) {
		return {
			success: false,
			message: ex?.toString(),
		};
	}
}

pdfFormFillRouter.post("/", async (req: Request, res: Response) => {
	var builderKey = req.body.builderKey;

	if (!builderKey) {
		sendArgumentError(res, "The builderKey parameter is required.");
		return;
	}
	if (!isValidBuilderKey(builderKey) || !doesTemplateExist(builderKey)) {
		sendArgumentError(
			res,
			`The builderKey parameter '${builderKey}' is not valid.`
		);
		return;
	}

	const formFields = req.body.formFields;
	if (!formFields) {
		sendArgumentError(res, "The formField parameter is required.");
		return;
	}

	var result = await formFillTemplate(builderKey, formFields);
	sendOKResult(res, "Success", {
		success: result.success,
		message: result.message,
		missingFields: result.missingFields,
		pdfData:
			result.pdfBytes !== undefined ? base64encode(result.pdfBytes) : undefined,
	});
});
