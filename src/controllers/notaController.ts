import { Request, Response } from "express";
import fs from 'fs';
import path from 'path'; 
import { NotaType } from "../models/notaType";

const notaDir = path.join(__dirname, '../../arquivos/Notas');
const nota = "./arquivos/Notas";
const notas: NotaType[] = [];

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
  getAll: async (req: Request, res: Response) => {
    generateNotes();
    res.json(
      notas
   );
  }
  
};

export default notaController;