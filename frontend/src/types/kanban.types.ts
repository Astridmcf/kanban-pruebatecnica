export interface Card {
  id: string;
  title: string;
  content?: string | null;
  order: number;
  columnId: string;
}

export interface Column {
  id:string;
  title: string;
  order: number;
  cards: Card[];
  color?: string; // Nuevo campo opcional para el color de la columna
}
