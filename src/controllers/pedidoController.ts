import { Request, Response } from "express";
import fs from 'fs';
import path from 'path'; 
import { NotaType } from "../models/notaType";
import { PedidoType } from "../models/pedidoType";

const pedido = "./arquivos/Pedidos";
let pedidos: PedidoType[] = [];

function generatePedidos(){
  fs.readdirSync(pedido).forEach((fileName: string) => {
    if (path.extname(fileName) === '.txt') {
      const filePath = path.join(pedido, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');

      lines.forEach((line) => {
        const sanitizedLine = line.trim().replace(/^\uFEFF/, '').replace('número', 'numero').replace('código', 'codigo').replace('unitário', 'unitario');
        if(sanitizedLine.trim() !== ''){
          try {
            const pedidoCada: PedidoType = JSON.parse(sanitizedLine);
            pedidos.push(pedidoCada);
            console.log(pedidoCada);
          } catch (error: any) {
            console.error(error);
            console.error(`Erro ao analisar linha do arquivo ${fileName}: ${error}`);
          }
        }
      });
    }
  });
}

const pedidoController = {
  getAll: async (req: Request, res: Response) => {
    let { id } = req.query;
    pedidos = [];
    generatePedidos();

      res.json(
        pedidos
      );
  }
}

export default pedidoController;