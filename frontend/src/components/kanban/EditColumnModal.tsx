"use client"

import { useState, useEffect } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { fetcher } from '@/lib/api';
import { toast } from 'sonner';

export const EditColumnModal = () => {
  const { editingColumn, setEditingColumn } = useBoardStore();
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (editingColumn) {
      setTitle(editingColumn.title);
      setColor(editingColumn.color || '#A3A3A3');
    }
  }, [editingColumn]);

  if (!editingColumn) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("El título no puede estar vacío.");
      return;
    }
    try {
      await fetcher(`/api/columns/${editingColumn.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, color }),
      });
      setEditingColumn(null); // Cierra el modal al guardar
      // La actualización de la UI la manejará el WebSocket
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al actualizar la columna.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Columna</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              placeholder="Título de la columna"
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-12 p-1 bg-transparent border-none rounded-full cursor-pointer"
              title="Cambiar color de la columna"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setEditingColumn(null)} className="px-4 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
};
