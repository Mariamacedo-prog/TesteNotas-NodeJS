import express, { Router, Request, Response } from "express";
import notaController from "../controllers/notaController";

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true });
});

router.get("/notas", notaController.getAll);


export default router;