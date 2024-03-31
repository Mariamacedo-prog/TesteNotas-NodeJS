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