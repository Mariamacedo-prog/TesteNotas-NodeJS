
export interface ItemPendenteType{
  numero_item: number; 
  saldo_pendente: string; 
}
export interface PedidoPendenteType{
  id: number; 
  valor_total_pedido: string;
  saldo_valor: string; 
  itens_pendentes: ItemPendenteType[]
}



export interface PedidoItemType{
  numero_item: number; 
  codigo_produto: string;
  quantidade_produto: number; 
  valor_unitario_produto: string;
}
export interface PedidoType {
  id: number;
  pedido: PedidoItemType[]
}