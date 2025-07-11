"use client"

import type { Column } from "@/types/kanban.types"
import KanbanCard from "@/components/kanban/KanbanCard"
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { useMemo } from "react"
import { CSS } from "@dnd-kit/utilities"
import { CreateCard } from "@/components/kanban/CreateCard"
import { MoreHorizontal, Trash } from "lucide-react"
import { useBoardStore } from "@/store/boardStore"
import { fetcher } from "@/lib/api"

interface KanbanColumnProps {
  column: Column
}

const KanbanColumn = ({ column }: KanbanColumnProps) => {
  const { removeColumn, setEditingColumn } = useBoardStore() // <-- Obtén setEditingColumn del store
  const cardIds = useMemo(() => column.cards.map((card) => card.id), [column.cards])
  const { setNodeRef, transform, transition } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDeleteColumn = async () => {
    try {
      await fetcher(`/api/columns/${column.id}`, {
        method: "DELETE",
      })
      removeColumn(column.id)
    } catch (error) {
      // Opcional: puedes manejar errores silenciosamente o con un toast genérico en useSocket
    }
  }

  // --- NUEVA FUNCIÓN PARA ABRIR EL MODAL ---
  const handleEditColumn = () => {
    setEditingColumn(column);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col w-80 shrink-0"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 mb-3">
        <div className="flex items-center gap-3">
          {/* --- INDICADOR DE COLOR DINÁMICO --- */}
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color || '#A3A3A3' }}
          />
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{column.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-300 rounded-full px-3 py-1 shadow-sm"
          >
            {column.cards.length}
          </span>
          <button
            onClick={handleEditColumn} // <-- AÑADE EL EVENTO ONCLICK AQUÍ
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200"
            title="Editar columna"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </button>
          <button
            onClick={handleDeleteColumn}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
            title="Eliminar columna"
          >
            <Trash className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>
      {/* Column Content */}
      <div
        className="flex flex-col gap-3 p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl h-full border border-slate-200 dark:border-slate-700 shadow-inner"
      >
        <SortableContext items={cardIds}>
          <div className="flex flex-col gap-3">
            {column.cards.map((card, index) => (
              <div key={card.id}>
                <KanbanCard card={card} />
              </div>
            ))}
          </div>
        </SortableContext>
        <div>
          <CreateCard columnId={column.id} />
        </div>
      </div>
    </div>
  )
}

export default KanbanColumn
