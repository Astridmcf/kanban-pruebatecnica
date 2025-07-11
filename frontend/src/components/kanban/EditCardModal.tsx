import { useState, useEffect } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { fetcher } from '@/lib/api';
import type { Card } from "@/types/kanban.types";

export const EditCardModal = () => {
  const { editingCard, setEditingCard, updateCard } = useBoardStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (editingCard) {
      setTitle(editingCard.title);
      setContent(editingCard.content || '');
    }
  }, [editingCard]);

  if (!editingCard) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedCard = await fetcher<Card>(`/api/cards/${editingCard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      updateCard(updatedCard); // <-- ACTUALIZACIÓN OPTIMISTA

      setEditingCard(null); // Cierra el modal
    } catch (error) {
      console.error("Failed to update card", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Tarjeta</h2>
        <form onSubmit={handleSave}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded mb-4 dark:bg-slate-700 dark:border-slate-600"
            placeholder="Título de la tarjeta"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded mb-4 h-32 dark:bg-slate-700 dark:border-slate-600"
            placeholder="Añade una descripción más detallada..."
          />
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setEditingCard(null)} className="px-4 py-2 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
