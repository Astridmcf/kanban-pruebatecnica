"use client"

import type { Card } from "@/types/kanban.types"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash } from "lucide-react"
import { useBoardStore } from "@/store/boardStore"
import { fetcher } from "@/lib/api"

interface KanbanCardProps {
  card: Card
}

const KanbanCard = ({ card }: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card,
    },
  });

  const { setEditingCard } = useBoardStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetcher(`/api/cards/${card.id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete card:", error);
    }
  };

  const handleCardClick = () => {
    if (isDragging) return;
    setEditingCard(card);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={handleCardClick}
      className={`group relative p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer active:cursor-grabbing ${
        isDragging
          ? "ring-2 ring-blue-500 shadow-xl scale-105 rotate-2 opacity-90"
          : "hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          onClick={handleDelete}
          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/50"
          title="Eliminar tarjeta"
        >
          <Trash className="h-4 w-4 text-red-500" />
        </button>
        <div
          {...listeners}
          className="p-1.5 cursor-grab"
        >
           <GripVertical className="h-4 w-4 text-slate-400" />
        </div>
      </div>
      <div className="pr-10">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{card.title}</h3>
        {card.content && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{card.content}</p>
        )}
      </div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}

export default KanbanCard;
