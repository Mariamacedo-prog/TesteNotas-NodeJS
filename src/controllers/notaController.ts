import { Request, Response } from "express";
import fs from 'fs';
import path from 'path'; 
import { NotaItemType, NotaType } from "../models/notaType";
import { gePedidosArray } from "./pedidoController";
import { PedidoItemType, PedidoType } from "../models/pedidoType";
const nota = "./arquivos/Notas";
export let notas: NotaType[] = [];

export function generateNotes(){
  fs.readdirSync(nota).forEach((fileName: string) => {
    if (path.extname(fileName) === '.txt') {
      const filePath = path.join(nota, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');
      let notaByFile: NotaType = { id: parseInt(fileName.replace(/[^\d]/g, '')), nota: [] };

      lines.forEach((line) => {
        const sanitizedLine = line.trim().replace(/^\uFEFF/, '').replace('número', 'numero');
        if(sanitizedLine.trim() !== ''){
          try {
            const notaCada: NotaItemType = JSON.parse(sanitizedLine);

            // Lançar exceção: Caso seja verificado que algum valor da Nota não corresponda ao tipo descrito;
            if (
              typeof notaCada.id_pedido != 'number' ||
              typeof notaCada.numero_item != 'number' ||
              typeof notaCada.quantidade_produto != 'number'
            ) {
              throw new Error(`Tipo de dado incorreto na linha do arquivo ${fileName}`);
            }

            // Lançar exceção: Caso id_pedido não exista;
            let pedidosList: PedidoType[] = gePedidosArray();
            let pedidosById = pedidosList.find(item => item.id == notaCada.id_pedido)
            console.log(pedidosById);
            if(!pedidosById) {
              throw new Error(`id_pedido ${notaCada.id_pedido} no arquivo ${fileName} inexistente;`);
            }

            // Lançar exceção: Caso numero_item não exista;
            let allPedidoItem: PedidoItemType[] = [];
            for(let item of pedidosList){
              allPedidoItem = allPedidoItem.concat(item.pedido);
            }

            let pedidosByNumeroItem = allPedidoItem.find(item => item.numero_item == notaCada.numero_item);
            console.log(pedidosByNumeroItem);
            if(!pedidosByNumeroItem) {
              throw new Error(`numero_item ${notaCada.numero_item} no arquivo ${fileName} inexistente;`);
            }

            
            notaByFile.nota.push(notaCada);
          } catch (error: any) {
            throw new Error(`Erro na linha do arquivo ${fileName}: ${error}`);
          }
        }
      });

      notas.push(notaByFile);
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

    // let notesByPedidoId = notas.filter((item: NotaType) => item.id_pedido.toString() == id);
    // res.json(
    //   notesByPedidoId
    // );
  }
};

export default notaController;