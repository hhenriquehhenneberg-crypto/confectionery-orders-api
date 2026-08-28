import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { database } from "../config/database";

export class CategoryController {
  async list(_req: Request, res: Response): Promise<void> {
    try {
      const result = await database.query(
        `select id, name, description, icon, display_order, active, created_at, updated_at
         from categories
         where active = true
         order by display_order, name`
      );

      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao listar categorias." });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    const { name, description = null, icon = null, display_order } = req.body;

    if (!name || display_order === undefined) {
      res.status(400).json({ message: "name e display_order são obrigatórios." });
      return;
    }

    try {
      const id = randomUUID();
      const result = await database.query(
        `insert into categories (id, name, description, icon, display_order)
         values ($1, $2, $3, $4, $5)
         returning *`,
        [id, name, description, icon, display_order]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar categoria." });
    }
  }
}
