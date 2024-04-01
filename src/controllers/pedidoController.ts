import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path'; 
import { PedidoItemType, PedidoType } from '../models/pedidoType';

const PEDIDO_DIR = './arquivos/Pedidos';
let pedidos: PedidoType[] = [];

function hasDuplicateNumeroItem(array: PedidoItemType[]): boolean {
  const uniqueItems = new Set<number>();
  for (const item of array) {
    if (uniqueItems.has(item.numero_item)) {
      return true;
    }
    uniqueItems.add(item.numero_item);
  }
  return false;
}

function hasMissingNumeroItem(array: PedidoItemType[]): boolean {
  const maxNumero = Math.max(...array.map(item => item.numero_item));
  for (let i = 1; i <= maxNumero; i++) {
    if (!array.some(item => item.numero_item === i)) {
      return true; 
    }
  }
  return false; 
}

function parsePedidoFile(fileName: string): PedidoType {
  const filePath = path.join(PEDIDO_DIR, fileName);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const pedido: PedidoType = { id: parseInt(fileName.replace(/[^\d]/g, '')), pedido: [] };

  lines.forEach((line) => {
    const sanitizedLine = line.trim().replace(/^\uFEFF/, '').replace('número', 'numero').replace('código', 'codigo').replace('unitário', 'unitario');
    if (sanitizedLine.trim() !== '') {
      try {
        const pedidoCada: PedidoItemType = JSON.parse(sanitizedLine);
        if (typeof pedidoCada.numero_item !== 'number' ||
            typeof pedidoCada.quantidade_produto !== 'number' ||
            typeof pedidoCada.codigo_produto !== 'string' || 
            typeof pedidoCada.valor_unitario_produto !== 'string') {
          throw new Error(`Tipo de dado incorreto na linha do arquivo ${fileName}`);
        }
        pedido.pedido.push(pedidoCada);
      } catch (error: any) {
        throw new Error(`Erro na linha do arquivo ${fileName}: ${error}`);
      }
    }
  });

  if (hasDuplicateNumeroItem(pedido.pedido)) {
    throw new Error(`O numero_item de um mesmo pedido no arquivo ${fileName}, esta se repetindo`);
  }

  if (hasMissingNumeroItem(pedido.pedido)) {
    throw new Error(`Falta algum numero_item no arquivo ${fileName}`);
  }

  return pedido;
}

function generatePedidos(): void {
  pedidos = fs.readdirSync(PEDIDO_DIR)
    .filter(fileName => path.extname(fileName) === '.txt')
    .map(fileName => parsePedidoFile(fileName));
}

export function gePedidosArray(): PedidoType[] {
  generatePedidos();
  return pedidos;
}

const pedidoController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    generatePedidos();
    res.json(pedidos);
  }
};

export default pedidoController;