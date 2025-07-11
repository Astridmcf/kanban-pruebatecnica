"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fetcher } from "@/lib/api"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"
import { useBoardStore } from "@/store/boardStore"
import type { Card } from "@/types/kanban.types"

interface CreateCardProps {
  columnId: string
}

export const CreateCard = ({ columnId }: CreateCardProps) => {
  const { addCard } = useBoardStore();
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      // La API ahora devuelve la tarjeta creada
      const newCard = await fetcher<Card>("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, columnId }),
      });

      addCard(newCard); // <-- ACTUALIZACIÓN OPTIMISTA

      setTitle("");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo al crear la tarjeta.");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isEditing ? (
        <motion.button
          key="add-button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsEditing(true)}
          className="group flex items-center justify-start w-full gap-3 p-3 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-200 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600"
        >
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
            <Plus className="h-5 w-5" />
          </motion.div>
          <span className="font-medium">Añadir una tarjeta</span>
        </motion.button>
      ) : (
        <motion.form
          key="add-form"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <textarea
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
              if (e.key === "Escape") {
                setIsEditing(false)
              }
            }}
            placeholder="Escribe el título de la tarjeta..."
            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
                Crear tarjeta
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
