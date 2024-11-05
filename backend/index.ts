import { apiTestRouter } from "./api/api-test";
import { pdfFormFillRouter } from "./api/pdf-form-fill";
import app from "./utils/httpServer";

// Build API
app.use("/api-test", apiTestRouter);
app.use("/pdf-form-fill", pdfFormFillRouter);
