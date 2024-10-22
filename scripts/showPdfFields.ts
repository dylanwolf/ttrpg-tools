import * as fs from "fs";
import * as path from "path";
import { PDFDocument } from "pdf-lib";

console.log(path.resolve("../../backend/pdf-form-fills/ryuutama.pdf"));

const bytes = fs.readFileSync("../../backend/pdf-form-fills/ryuutama.pdf");
PDFDocument.load(bytes).then((pdfDoc) => {
	const form = pdfDoc.getForm();
	const allFields = form.getFields();
	console.log(allFields.map((f: any) => f.getName()));
});
