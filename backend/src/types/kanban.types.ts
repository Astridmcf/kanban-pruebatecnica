export interface Card {
  id: string;
  title: string;
  content?: string | null; // Permitir null para compatibilidad con Prisma
  order: number;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards?: Card[];
}

export interface KanbanBoard {
  columns: Column[];
}

export interface CardMoveOperation {
  cardId: string;
  sourceColumnId: string;
  targetColumnId: string;
  sourceOrder: number;
  targetOrder: number;
}

export interface WebSocketEvent<T = any> {
  type: string;
  data: T;
  timestamp: Date;
}
