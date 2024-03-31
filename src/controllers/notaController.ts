import { Request, Response } from "express";
import fs from 'fs';
import path from 'path'; 
import { NotaType } from "../models/notaType";

const notaDir = path.join(__dirname, '../../arquivos/Notas');
const nota = "./arquivos/Notas";
let notas: NotaType[] = [];

function generateNotes(){
  fs.readdirSync(nota).forEach((fileName: string) => {
    if (path.extname(fileName) === '.txt') {
      const filePath = path.join(nota, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');

      lines.forEach((line) => {
        const sanitizedLine = line.trim().replace(/^\uFEFF/, '').replace('número', 'numero');
        if(sanitizedLine.trim() !== ''){
          try {
            const notaCada: NotaType = JSON.parse(sanitizedLine);
            notas.push(notaCada);
            console.log(notaCada);
          } catch (error: any) {
            console.error(error);
            console.error(`Erro ao analisar linha do arquivo ${fileName}: ${error}`);
          }
        }
      });
    }
  });
}

const notaController = {
  getAllOrByPedidoId: async (req: Request, res: Response) => {
    let { id } = req.query;
    notas = [];
    generateNotes();

    if (typeof id !== 'string' || id === undefined) {
      res.json(
        notas
      );
      return;
    }

    let notesByPedidoId = notas.filter((item: NotaType) => item.id_pedido.toString() == id);
    res.json(
      notesByPedidoId
    );
  }
};

export default notaController;