import { Request, Response } from "express";
import fs from 'fs';
import path from 'path'; 
import { PedidoItemType, PedidoType } from "../models/pedidoType";

const pedido = "./arquivos/Pedidos";
let pedidos: PedidoType[] = [];

function hasDuplicateNumeroItem(array: PedidoType) {
  return array.pedido.some((item, index) => array.pedido.findIndex(elem => elem.numero_item === item.numero_item) !== index);
}

function hasMissingNumeroItem(array: PedidoType) {
  const maxNumero = Math.max(...array.pedido.map(item => item.numero_item));

  for (let i = 1; i <= maxNumero; i++) {
    if (!array.pedido.some(item => item.numero_item === i)) {
        return true; 
    }
  }
  return false; 
}

function generatePedidos(){
  fs.readdirSync(pedido).forEach((fileName: string) => {
    if (path.extname(fileName) === '.txt') {
      const filePath = path.join(pedido, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');
      let pedidoByFile: PedidoType = { id: parseInt(fileName.replace(/[^\d]/g, '')), pedido: [] };
    

      lines.forEach((line) => {
        const sanitizedLine = line.trim().replace(/^\uFEFF/, '').replace('número', 'numero').replace('código', 'codigo').replace('unitário', 'unitario');
        if(sanitizedLine.trim() !== ''){
          try {
            let pedidoCada: PedidoItemType = JSON.parse(sanitizedLine);

            //Lançar exceção: Caso seja verificado que algum valor do Pedido não corresponda ao tipo descrito;
            if ( 
              typeof pedidoCada.numero_item != 'number' ||
              typeof pedidoCada.quantidade_produto != 'number' ||
              typeof pedidoCada.codigo_produto != 'string' || 
              typeof pedidoCada.valor_unitario_produto != 'string'
            ) {
              throw new Error(`Tipo de dado incorreto na linha do arquivo ${fileName}`);
            }
            pedidoByFile.pedido.push(pedidoCada);
          } catch (error: any) {
            throw new Error(`Erro na linha do arquivo ${fileName}: ${error}`);
          }
        }
      });



      // Lançar exceção: Caso haja repetição de algum numero_item de um mesmo pedido;
      if(hasDuplicateNumeroItem(pedidoByFile)){
        throw new Error(`O numero_item de um mesmo pedido no arquivo ${fileName}, esta se repetindo`);
      };

      // Lançar exceção: Caso falte algum numero_item (deve haver todos os números consecutivos de 1 ao maior número de item daquele pedido);
      if(hasMissingNumeroItem(pedidoByFile)){
        throw new Error(`Falta algum numero_item no arquivo ${fileName}`);
      };

      pedidos.push(pedidoByFile);
    }
  });
}


export function gePedidosArray(){
  generatePedidos();

  return pedidos;
}

const pedidoController = {
  getAll: async (req: Request, res: Response) => {
    pedidos = [];
    generatePedidos();

      res.json(
        pedidos
      );
  }
}

export default pedidoController;