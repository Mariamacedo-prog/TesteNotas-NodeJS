import { Request, Response } from "express";
import fs from 'fs';
import path from 'path'; 
import { NotaItemType, NotaType } from "../models/notaType";
import { gePedidosArray } from "./pedidoController";
import { PedidoItemType, PedidoType } from "../models/pedidoType";
const nota = "./arquivos/Notas";
export let notas: NotaType[] = [];


function hasNumeroItem(array: PedidoType[], nota: NotaItemType) {
  let allPedidoItem: PedidoItemType[] = [];
  for(let item of array){
    allPedidoItem = allPedidoItem.concat(item.pedido);
  }
  return allPedidoItem.find(item => item.numero_item == nota.numero_item);
}


function hasPedidoId(array: PedidoType[], nota: NotaItemType) {
  return array.find(item => item.id == nota.id_pedido)
}

function hasQuantidadeItem(array: PedidoType[]) {
  let allNotas:NotaItemType[] = [];
  for(let item of notas){
    for(let i of item.nota){
      let foundIndex = allNotas.findIndex((item) => item.id_pedido == i.id_pedido && item.numero_item == i.numero_item);

      if (foundIndex !== -1) {
        const notaCopy = { ...allNotas[foundIndex] };
        notaCopy.quantidade_produto += i.quantidade_produto;
        allNotas[foundIndex] = notaCopy;
      } else {
        allNotas.push({ ...i }); 
      }

    }
  }

  for (const itemNota of allNotas) {
    const pedidoCorrespondente = array.find(pedido => pedido.id === itemNota.id_pedido);

    if (pedidoCorrespondente) {
      const itemPedido = pedidoCorrespondente.pedido.find(item => item.numero_item === itemNota.numero_item);
        
      if (itemPedido && itemNota.quantidade_produto > itemPedido.quantidade_produto) {
        throw new Error(`Item: ${itemNota.numero_item} possui quantidade de ${itemNota.quantidade_produto}, porém o máximo permitido é de ${itemPedido.quantidade_produto}`);
      }
    }
  }
}

export async function generateNotes(){
  const files = fs.readdirSync(nota);
  let pedidosList: PedidoType[] = gePedidosArray();

  for (const fileName of files) {
    if (path.extname(fileName) === '.txt') {
      const filePath = path.join(nota, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');
      let notaByFile: NotaType = { id: parseInt(fileName.replace(/[^\d]/g, '')), nota: [] };

      for (const line of lines) {
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
            if(!hasPedidoId(pedidosList, notaCada)) {
              throw new Error(`id_pedido ${notaCada.id_pedido} no arquivo ${fileName} inexistente;`);
            }
            // Lançar exceção: Caso numero_item não exista;
            if(!hasNumeroItem(pedidosList, notaCada)) {
              throw new Error(`numero_item ${notaCada.numero_item} no arquivo ${fileName} inexistente;`);
            }

            notaByFile.nota.push(notaCada);
          } catch (error: any) {
            throw new Error(`Erro na linha do arquivo ${fileName}: ${error}`);
          }
        }
      }

      notas.push(notaByFile);
    }
  }

  // Lançar exceção: Caso a soma das quantidades informadas para um item ultrapassar a quantidade do item do pedido.
  hasQuantidadeItem(pedidosList);
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
  }
};

export default notaController;