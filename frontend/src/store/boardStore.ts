import { create } from 'zustand';
import { Column, Card } from '@/types/kanban.types';

interface BoardState {
  columns: Column[];
  setColumns: (columns: Column[]) => void;
  addColumn: (column: Column) => void;
  updateColumn: (updatedColumn: Column) => void;
  removeColumn: (columnId: string) => void;
  addCard: (card: Card) => void;
  updateCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  moveCard: (updatedCard: Card) => void;
  editingCard: Card | null;
  setEditingCard: (card: Card | null) => void;
  editingColumn: Column | null;
  setEditingColumn: (column: Column | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],
  editingCard: null,
  editingColumn: null,

  setColumns: (columns) => set({ columns }),

  // --- FUNCIÓN 'addColumn' CORREGIDA ---
  addColumn: (newColumn) =>
    set((state) => {
      // Evitar duplicados: si la columna ya existe en el estado, no hacer nada.
      if (state.columns.some(col => col.id === newColumn.id)) {
        return { columns: state.columns };
      }
      return { columns: [...state.columns, newColumn] };
    }),

  updateColumn: (updatedColumn) =>
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === updatedColumn.id ? { ...col, ...updatedColumn } : col
      ),
    })),

  removeColumn: (columnId) =>
    set((state) => ({
      columns: state.columns.filter((col) => col.id !== columnId),
    })),

  // --- FUNCIÓN 'addCard' CORREGIDA ---
  addCard: (newCard) =>
    set((state) => {
      // Comprobar si la tarjeta ya existe en cualquier columna para evitar duplicados.
      const cardExists = state.columns.some(col =>
        col.cards.some(card => card.id === newCard.id)
      );
      if (cardExists) {
        return state;
      }

      // Si no existe, añadirla a la columna correcta.
      return {
        columns: state.columns.map((col) =>
          col.id === newCard.columnId
            ? { ...col, cards: [...col.cards, newCard].sort((a, b) => a.order - b.order) }
            : col
        ),
      };
    }),

  updateCard: (updatedCard) =>
    set((state) => ({
      columns: state.columns.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        ),
      })),
    })),

  removeCard: (cardId) =>
    set((state) => ({
      columns: state.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== cardId),
      })),
    })),

  moveCard: (updatedCard: Card) =>
    set((state) => {
      const { id: cardId, columnId: newColumnId, order: newOrder } = updatedCard;
      const newColumns = state.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      }));
      const destColumn = newColumns.find((col) => col.id === newColumnId);
      if (!destColumn) return state;
      const cardToInsert = { ...updatedCard };
      destColumn.cards.splice(newOrder - 1, 0, cardToInsert);
      destColumn.cards = destColumn.cards.map((card, index) => ({
        ...card,
        order: index + 1,
      }));
      return { columns: newColumns };
    }),

  setEditingCard: (card) => set({ editingCard: card }),
  setEditingColumn: (column) => set({ editingColumn: column }),
}));
