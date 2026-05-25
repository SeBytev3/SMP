import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { AuthRequest } from '../middleware/auth';

export class CategoryController {
  /**
   * GET /api/categories
   * List active categories (public)
   */
  async listActive(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.listActive();
      
      const formatted = categories.map(c => {
        const { nameEs, nameEn, descriptionEs, descriptionEn, ...rest } = c;
        return {
          ...rest,
          name: nameEs,
          description: descriptionEs,
        };
      });

      res.json({ 
        categories: formatted 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/categories
   * List all categories including inactive (admin)
   */
  async listAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.listAll();

      const formatted = categories.map(c => {
        const { nameEs, nameEn, descriptionEs, descriptionEn, ...rest } = c;
        return {
          ...rest,
          name: nameEs,
          description: descriptionEs,
        };
      });

      res.json({ 
        categories: formatted 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/categories
   * Create new category (admin)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { nameEs, nameEn, descriptionEs, descriptionEn } = req.body;

      const category = await categoryService.create({
        nameEs,
        nameEn,
        descriptionEs,
        descriptionEn,
      });

      res.status(201).json({ category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/categories/:id
   * Update category (admin)
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = req.body;

      const category = await categoryService.update(id, data);
      res.json({ category });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
