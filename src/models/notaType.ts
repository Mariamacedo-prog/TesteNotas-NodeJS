export interface NotaItemType{
  id_arquivo: string;
  numero_item: number;
  id_pedido: number;
  quantidade_produto: number;
}

export interface NotaType {
  id: number;
  nota: NotaItemType[]
}