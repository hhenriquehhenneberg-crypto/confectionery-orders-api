import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { database } from "../config/database";

export class ProductController {
  async list(_req: Request, res: Response): Promise<void> {
    try {
      const result = await database.query(
        `select id, category_id, title, description, price, image, available, active, created_at, updated_at
         from products
         where active = true
         order by title`
      );

      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao listar produtos." });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    const {
      category_id,
      title,
      description = null,
      price,
      image = null,
      available = true,
    } = req.body;

    if (!category_id || !title || price === undefined) {
      res.status(400).json({
        message: "category_id, title e price são obrigatórios.",
      });
      return;
    }

    try {
      const category = await database.query(
        "select id from categories where id = $1 and active = true",
        [category_id]
      );

      if (category.rowCount === 0) {
        res.status(400).json({ message: "Categoria não encontrada." });
        return;
      }

      const id = randomUUID();
      const result = await database.query(
        `insert into products (id, category_id, title, description, price, image, available)
         values ($1, $2, $3, $4, $5, $6, $7)
         returning *`,
        [id, category_id, title, description, price, image, available]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar produto." });
    }
  }
}
