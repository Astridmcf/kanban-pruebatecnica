"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fetcher } from "@/lib/api"
import { toast } from "sonner"
import { PlusCircle, X } from "lucide-react"
import { useBoardStore } from "@/store/boardStore"
import type { Column } from "@/types/kanban.types"

export const CreateColumn = () => {
  const { addColumn, columns } = useBoardStore(); // <-- Obtén también columns del store
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("El titulo de la columna no puede estar vacío.");
      return;
    }

    // --- VALIDACIÓN: evitar duplicados ---
    const exists = columns.some(col => col.title.trim().toLowerCase() === title.trim().toLowerCase());
    if (exists) {
      toast.error("Ya existe una columna con ese nombre.");
      return;
    }

    try {
      const newColumn = await fetcher<Column>("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      addColumn(newColumn); // <-- ACTUALIZACIÓN OPTIMISTA

      setTitle("");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al crear la columna.");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isEditing ? (
        <motion.button
          key="add-column-button"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsEditing(true)}
          className="group flex items-center gap-3 p-6 w-80 shrink-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 hover:from-blue-50 hover:to-indigo-100 dark:hover:from-slate-700 dark:hover:to-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-300 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-slate-500 shadow-sm hover:shadow-md"
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm group-hover:shadow-md transition-shadow duration-200"
          >
            <PlusCircle className="h-6 w-6" />
          </motion.div>
          <span className="font-semibold text-lg">Añadir otra columna</span>
        </motion.button>
      ) : (
        <motion.form
          key="add-column-form"
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="p-6 w-80 shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
        >
          <div className="space-y-4">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsEditing(false)
                }
              }}
              placeholder="Ingrese el titulo..."
              className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200"
            />
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Añadir columna
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
