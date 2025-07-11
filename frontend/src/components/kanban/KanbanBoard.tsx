"use client"

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useBoardStore } from "@/store/boardStore"
import { useSocket } from "@/hooks/useSocket"
import { fetcher } from "@/lib/api"
import type { Card, Column } from "@/types/kanban.types"
import KanbanColumn from "@/components/kanban/KanbanColumn"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import KanbanCard from "@/components/kanban/KanbanCard"
import { toast } from "sonner"
import { CreateColumn } from "@/components/kanban/CreateColumn"
import { Loader2 } from "lucide-react"
import { EditCardModal } from './EditCardModal';
import { EditColumnModal } from './EditColumnModal'; // <-- Importa el nuevo modal

const KanbanBoard = () => {
  const {
    columns,
    setColumns,
    moveCard,
  } = useBoardStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  useSocket();

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  )

  useEffect(() => {
    const getBoardState = async () => {
      try {
        setLoading(true);
        const data = await fetcher<{ columns: Column[] }>("/api/columns/board-state");
        setColumns(data.columns);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load board");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    getBoardState()
  }, [setColumns])

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Card") {
      setActiveCard(event.active.data.current.card);
    }
  };

  // --- onDragOver para feedback visual ---
  const onDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCard = active.data.current?.card as Card;
    if (active.data.current?.type !== "Card" || !activeCard) return;

    const sourceColumnId = activeCard.columnId;

    // Lógica de detección de destino robusta
    const overId = over.id.toString();
    const overIsAColumn = columns.some(col => col.id === overId);

    let destColumnId: string | undefined;
    if (overIsAColumn) {
      destColumnId = overId;
    } else {
      const overCardColumn = columns.find(col => col.cards.some(card => card.id === overId));
      destColumnId = overCardColumn?.id;
    }

    if (!destColumnId || sourceColumnId === destColumnId) return;

    // Actualización visual temporal
    moveCard({ ...activeCard, columnId: destColumnId, order: 1000 });
  }, [columns, moveCard]);

  // --- onDragEnd para la lógica final y persistencia ---
  const onDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCard = active.data.current?.card as Card;
    if (!activeCard) return;

    // Lógica de detección de destino robusta
    const overId = over.id.toString();
    const overIsAColumn = columns.some(col => col.id === overId);

    let destColumnId: string | undefined;
    if (overIsAColumn) {
      destColumnId = overId;
    } else {
      const overCardColumn = columns.find(col => col.cards.some(card => card.id === overId));
      destColumnId = overCardColumn?.id;
    }

    if (!destColumnId) return;

    const destColumn = columns.find(c => c.id === destColumnId);
    if (!destColumn) return;

    const overCardIndex = destColumn.cards.findIndex(c => c.id === overId);
    const newIndex = overCardIndex !== -1 ? overCardIndex : destColumn.cards.length;
    const newOrder = newIndex + 1;

    if (activeCard.columnId === destColumnId && activeCard.order === newOrder) {
      return;
    }

    try {
      await fetcher(`/api/cards/${activeCard.id}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newColumnId: destColumnId, newOrder }),
      });
    } catch (error) {
      toast.error("El movimiento falló. La interfaz se corregirá.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="animate-spin">
            <Loader2 className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Cargando tu tablero...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-semibold">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/40 dark:border-slate-700/40">
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
          <div className="flex gap-6 w-full h-full overflow-x-auto">
            <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-6">
                {columns.map((col) => (
                  <div key={col.id}>
                    <KanbanColumn column={col} />
                  </div>
                ))}
              </div>
            </SortableContext>
            <div>
              <CreateColumn />
            </div>
          </div>
          {createPortal(
            <DragOverlay>
              {activeCard && (
                <div className="transform-gpu">
                  <KanbanCard card={activeCard} />
                </div>
              )}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </div>
      <EditCardModal />
      <EditColumnModal /> {/* <-- Renderiza el modal aquí */}
    </>
  )
}

export default KanbanBoard
