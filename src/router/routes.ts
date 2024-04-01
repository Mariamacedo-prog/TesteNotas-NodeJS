import express, { Router, Request, Response } from "express";
import notaController from "../controllers/notaController";
import pedidoController from "../controllers/pedidoController";

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true });
});

//Notas Routes
router.get("/notas", notaController.getAll);

router.get("/pedidos", pedidoController.getAll);
export default router;