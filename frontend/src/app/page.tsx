"use client"

import { motion } from "framer-motion"
import KanbanBoard from "@/components/kanban/KanbanBoard"
import { Sparkles, Zap, Target } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Sección del Encabezado */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >


        <div className="relative px-4 py-12 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Título Principal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 dark:from-slate-100 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                Tablero Kanban
              </h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto mt-4 max-w-xs"
              />
            </motion.div>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Organiza tus tareas con estilo. Arrastra, suelta y gestiona tu flujo de trabajo con nuestro tablero Kanban intuitivo y elegante.
            </motion.p>

            {/* Píldoras de Características */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              {[
                { icon: Zap, text: "Súper Rápido", color: "from-yellow-500 to-orange-500" },
                { icon: Target, text: "Mantente Enfocado", color: "from-green-500 to-emerald-500" },
                { icon: Sparkles, text: "UI Elegante", color: "from-purple-500 to-pink-500" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className={`p-1 rounded-full bg-gradient-to-r ${feature.color}`}>
                    <feature.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Contenido Principal */}
      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative"
      >
        {/* Tablero Kanban */}
        <div className="px-4 pb-8 md:px-8 lg:px-12 h-[calc(100vh-280px)] min-h-[600px]">
          <KanbanBoard />
        </div>

        {/* Elementos Flotantes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl -z-10"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 1 }}
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-xl -z-10"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 1 }}
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-xl -z-10"
        />
      </motion.main>

      {/* Pie de Página */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="text-center py-8 px-4"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Hecho con ❤️ usando Next.js, Framer Motion y Tailwind CSS
        </p>
      </motion.footer>
    </div>
  )
}
