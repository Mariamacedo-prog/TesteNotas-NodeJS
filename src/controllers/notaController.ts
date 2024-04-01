import { Request, Response } from "express";
import fs from 'fs';
import path from 'path'; 
import { NotaItemType, NotaType } from "../models/notaType";
import { gePedidosArray } from "./pedidoController";
import { PedidoType } from "../models/pedidoType";

const NOTA_DIR = "./arquivos/Notas";
const FILE_EXTENSION = ".txt";

let notas: NotaType[] = [];

function hasNumeroItem(array: PedidoType[], nota: NotaItemType): boolean {
  return array.some(item => item.id === nota.id_pedido);
}

function hasPedidoId(array: PedidoType[], nota: NotaItemType): boolean {
  return array.some(item => item.pedido.some(pedido => pedido.numero_item === nota.numero_item));
}

function hasQuantidadeItem(pedidosList: PedidoType[]): void {
  const allNotas: NotaItemType[] = notas.flatMap(nota => nota.nota);

  for (const itemNota of allNotas) {
    const pedidoCorrespondente = pedidosList.find(pedido => pedido.id === itemNota.id_pedido);

    if (pedidoCorrespondente) {
      const itemPedido = pedidoCorrespondente.pedido.find(item => item.numero_item === itemNota.numero_item);
        
      if (itemPedido && itemNota.quantidade_produto > itemPedido.quantidade_produto) {
        throw new Error(`Item: ${itemNota.numero_item} possui quantidade de ${itemNota.quantidade_produto}, porém o máximo permitido é de ${itemPedido.quantidade_produto}`);
      }
    }
  }
}

async function generateNotes(): Promise<void> {
  const files = fs.readdirSync(NOTA_DIR);

  try {
    const pedidosList = gePedidosArray();

    for (const fileName of files) {
      if (path.extname(fileName) === FILE_EXTENSION) {
        const filePath = path.join(NOTA_DIR, fileName);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');
        const notaByFile: NotaType = { id: parseInt(fileName.replace(/[^\d]/g, '')), nota: [] };

        for (const line of lines) {
          const sanitizedLine = line.trim().replace(/^\uFEFF/, '').replace('número', 'numero');
          if(sanitizedLine.trim() !== ''){
            const notaCada: NotaItemType = JSON.parse(sanitizedLine);

            if (typeof notaCada.id_pedido !== 'number' ||
                typeof notaCada.numero_item !== 'number' ||
                typeof notaCada.quantidade_produto !== 'number') {
              throw new Error(`Tipo de dado incorreto na linha do arquivo ${fileName}`);
            }
            
            if (!hasPedidoId(pedidosList, notaCada)) {
              throw new Error(`id_pedido ${notaCada.id_pedido} no arquivo ${fileName} inexistente;`);
            }

            if (!hasNumeroItem(pedidosList, notaCada)) {
              throw new Error(`numero_item ${notaCada.numero_item} no arquivo ${fileName} inexistente;`);
            }

            notaByFile.nota.push(notaCada);
          }
        }

        notas.push(notaByFile);
      }
    }

    hasQuantidadeItem(pedidosList);
  } catch (error) {
    throw new Error(`Erro durante a geração de notas: ${error}`);
  }
}

const notaController = {
  getAll: async (req: Request, res: Response) => {
    const { id } = req.query;
    notas = [];
    await generateNotes();

    if (typeof id !== 'string' || id === undefined) {
      res.json(notas);
    }else{
      let allNotas:NotaType[]  = [...notas]
      
      let notasByPedidoId:NotaItemType[] = []
      for(let item of allNotas){
        for(let n of item.nota){
          if(n.id_pedido == parseInt(id)){
            notasByPedidoId.push(n);
          }
        }
      }

      res.json(notasByPedidoId);
    }
  }
};

export default notaController;