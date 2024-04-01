import { Router, Request, Response } from "express";
import notaController from "../controllers/notaController";
import pedidoController from "../controllers/pedidoController";

const router = Router();
//Teste de rota
router.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true });
});

//Notas 
router.get("/notas", notaController.getAll);
//Pedidos 
router.get("/pedidos", pedidoController.getAll);
//Notas Pendentes
router.get("/notas-pendentes", notaController.getNotaPendente);


export default router;