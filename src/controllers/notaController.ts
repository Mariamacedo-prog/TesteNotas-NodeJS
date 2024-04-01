
import { Request, Response } from "express";
import fs from 'fs';
import path from 'path'; 
import { NotaItemType, NotaType } from "../models/notaType";
import { PedidoType, PedidoItemType, ItemPendenteType, PedidoPendenteType } from "../models/pedidoType";
import { gePedidosArray } from "./pedidoController";


const NOTA_DIR = "./arquivos/Notas";
const FILE_EXTENSION = ".txt";

let notas: NotaType[] = [];

function hasNumeroItem(array: PedidoType[], nota: NotaItemType): boolean {
  return array.some(item => item.id === nota.id_pedido);
}

function hasPedidoId(array: PedidoType[], nota: NotaItemType): boolean {
  return array.some(item => item.pedido.some(pedido => pedido.numero_item === nota.numero_item));
}


function hasQuantidadeItem(array: PedidoType[]) {
  let allNotas:NotaItemType[];
  let notasCopy: NotaType[];
  notasCopy = [];
  allNotas = [];
  notasCopy  = [...notas];
  
  // Evite duplicação de notas
  for (let item of notas) {
    for (let i of item.nota) {
      let foundIndex = allNotas.findIndex((nota) => nota.id_pedido === i.id_pedido && nota.numero_item === i.numero_item);
      if (foundIndex !== -1) {
        allNotas[foundIndex].quantidade_produto += i.quantidade_produto;
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

  return false;
}

async function generateNotes(): Promise<void> {
  notas = [];
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


// Função para calcular o valor total de um item do pedido
function calcularValorTotalItem(item: PedidoItemType): number {
  return parseFloat(item.valor_unitario_produto) * item.quantidade_produto;
}
// Função para calcular o valor total de um pedido
function calcularValorTotalPedido(pedido: PedidoType): number {
  return pedido.pedido.reduce((total, item) => total + calcularValorTotalItem(item), 0);
}
// Função para verificar se um item do pedido foi atendido
function itemAtendido(itemPedido: PedidoItemType, quantidadeTotal: number): boolean {
  return itemPedido.quantidade_produto <= quantidadeTotal;
}
// Função para gerar a listagem de itens pendentes
function gerarItensPendentes(notas: NotaType[], pedidos: PedidoType[]): string {
  let itensPendentes = '';

  for (const pedido of pedidos) {
      let valorTotalPedido = calcularValorTotalPedido(pedido);
      let saldoValor = 0;

      for (const itemPedido of pedido.pedido) {
          let quantidadeTotal = 0;

          for (const nota of notas) {
              const notaItem = nota.nota.find(notaItem => notaItem.id_pedido === pedido.id && notaItem.numero_item === itemPedido.numero_item);
              if (notaItem) {
                  quantidadeTotal += notaItem.quantidade_produto;
              }
          }

          if (!itemAtendido(itemPedido, quantidadeTotal)) {
              const saldoQuantidade = itemPedido.quantidade_produto - quantidadeTotal;
              const valorItem = calcularValorTotalItem(itemPedido);
              saldoValor += valorItem * (saldoQuantidade / itemPedido.quantidade_produto);

              itensPendentes += `Número do item: ${itemPedido.numero_item}, Saldo da quantidade: ${saldoQuantidade}\n`;
          }
      }

      if (itensPendentes !== '') {
          itensPendentes = `Pedido: ${pedido.id}\nValor total do pedido: ${valorTotalPedido}\nSaldo do valor: ${saldoValor}\nItens Pendentes:\n${itensPendentes}\n\n`;
      }
  }

  return itensPendentes;
}

// Função para gravar a listagem de itens pendentes em um arquivo
function gravarListagemItensPendentes(listagem: string, arquivo: string): void {
  fs.writeFileSync(arquivo, listagem);
}

const notaController = {
  getAll: async (req: Request, res: Response) => {
    const { id } = req.query;
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
  },
  getNotaPendente: async (req: Request, res: Response) => {
    await generateNotes();
    const pedidos = gePedidosArray();
    let notasCopy:NotaType[] = [];
    let notasByPedidoId:NotaItemType[] = [];
    notasCopy  = [...notas];

    let pedidosPendentes:PedidoPendenteType[];
    pedidosPendentes = [];

    for (let item of notasCopy) {
      for (let i of item.nota) {
        let foundIndex = notasByPedidoId.findIndex((nota) => nota.id_pedido === i.id_pedido && nota.numero_item === i.numero_item);
        if (foundIndex !== -1) {
          notasByPedidoId[foundIndex].quantidade_produto += i.quantidade_produto;
        } else {
  
          notasByPedidoId.push({ ...i });
        }
      }
    }
  
    for (const itemNota of notasByPedidoId) {
      const pedidoCorrespondente = pedidos.find(pedido => pedido.id === itemNota.id_pedido);
      if (pedidoCorrespondente) {
        let newPedidoPendente: PedidoPendenteType = {  
          id: 0, 
          valor_total_pedido: "", 
          saldo_valor: "", 
          itens_pendentes: []
        };



        const itemPedido = pedidoCorrespondente.pedido.find(item => item.numero_item === itemNota.numero_item);
  
        if (itemPedido && itemNota.quantidade_produto < itemPedido.quantidade_produto) {
          newPedidoPendente.id = pedidoCorrespondente.id;
          let foundPedido = pedidosPendentes.find((pedido) => pedido.id === newPedidoPendente.id);
          if(foundPedido){
            newPedidoPendente = foundPedido;
            let totalValores = 0;
            for(let valor of pedidoCorrespondente.pedido){
              totalValores = totalValores + (valor.quantidade_produto * parseFloat(valor.valor_unitario_produto));
            }
 
            newPedidoPendente.valor_total_pedido = totalValores.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          }

          
         

          let valorString = (itemPedido.quantidade_produto - itemNota.quantidade_produto) * parseFloat(itemPedido.valor_unitario_produto.replace(",", "."));

          newPedidoPendente.itens_pendentes.push({
            numero_item: itemNota.numero_item, 
            saldo_pendente: valorString.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          })

          let foundIndex = pedidosPendentes.findIndex((pedido) => pedido.id === newPedidoPendente.id);
          if (foundIndex !== -1) {
            pedidosPendentes[foundIndex] = newPedidoPendente;
          } else {
            pedidosPendentes.push(newPedidoPendente)
          }
        }
      }
    }


    res.json({itens_pendentes: pedidosPendentes});


    const listagemItensPendentes = gerarItensPendentes(notas, pedidos);
    gravarListagemItensPendentes(listagemItensPendentes, 'itens_pendentes.txt');
  }
};

export default notaController;