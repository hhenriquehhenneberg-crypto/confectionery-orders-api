import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({ message: "Dados inválidos.", errors: error.issues.map(issue => ({
      field: issue.path.join("."), message: issue.message,
    })) });
    return;
  }
  if (error && typeof error === "object" && "type" in error) {
    if (error.type === "entity.parse.failed") {
      res.status(400).json({ message: "JSON inválido." });
      return;
    }
    if (error.type === "entity.too.large") {
      res.status(413).json({ message: "Corpo da requisição muito grande." });
      return;
    }
  }
  // Não registrar o objeto completo: erros do driver podem conter dados pessoais.
  console.error("Erro interno ao processar a requisição.");
  res.status(500).json({ message: "Erro interno do servidor." });
};
