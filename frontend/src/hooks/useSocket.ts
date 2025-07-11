import { useEffect, useRef, useCallback } from 'react';
import { socket } from '@/lib/socket';
import { useBoardStore } from '@/store/boardStore';
import { Card, Column } from '@/types/kanban.types';
import { toast } from 'sonner';

interface WebSocketEvent<T> {
  type: string;
  data: T;
  timestamp: string;
}

export const useSocket = () => {
  const {
    addColumn,
    addCard,
    updateCard,
    removeCard,
    removeColumn,
    moveCard,
    updateColumn
  } = useBoardStore();

  // Usar useRef para acceder al estado actual sin causar re-renders
  const storeRef = useRef(useBoardStore.getState());
  const isConnectedRef = useRef(false);

  // Memoizar las funciones de manejo de eventos para evitar recreaciones
  const handleConnect = useCallback(() => {
    console.log('Socket conectado');
    isConnectedRef.current = true;
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('Socket desconectado');
    isConnectedRef.current = false;
  }, []);

  const handleColumnCreated = useCallback((event: WebSocketEvent<Column>) => {
    addColumn(event.data);
    toast.success(`Columna creada: "${event.data.title}"`);
  }, [addColumn]);

  const handleCardCreated = useCallback((event: WebSocketEvent<Card>) => {
    addCard(event.data);
    toast.success(`Tarjeta creada: "${event.data.title}"`);
  }, [addCard]);

  const handleCardUpdated = useCallback((event: WebSocketEvent<Card>) => {
    updateCard(event.data);
    toast.info(`Tarjeta actualizada: "${event.data.title}"`);
  }, [updateCard]);

  const handleColumnUpdated = useCallback((event: WebSocketEvent<Column>) => {
    updateColumn(event.data);
    toast.info(`Columna actualizada: "${event.data.title}"`);
  }, [updateColumn]);

  const handleCardMoved = useCallback((event: WebSocketEvent<Card>) => {
    // Actualización rápida y eficiente del estado local
    moveCard(event.data);
    toast.info(`La tarjeta "${event.data.title}" fue movida.`);
  }, [moveCard]);

  const handleCardDeleted = useCallback((event: WebSocketEvent<{ cardId: string }>) => {
    const currentColumns = storeRef.current.columns;
    const cardTitle = currentColumns
      .flatMap((col) => col.cards)
      .find((card) => card.id === event.data.cardId)?.title;

    removeCard(event.data.cardId);

    if (cardTitle) {
      toast.error(`Tarjeta eliminada: "${cardTitle}"`);
    } else {
      toast.error('Una tarjeta fue eliminada.');
    }
  }, [removeCard]);

  const handleColumnDeleted = useCallback((event: WebSocketEvent<{ columnId: string }>) => {
    const currentColumns = storeRef.current.columns;
    const columnTitle = currentColumns.find(col => col.id === event.data.columnId)?.title;

    removeColumn(event.data.columnId);

    if (columnTitle) {
      toast.error(`Columna eliminada: "${columnTitle}"`);
    } else {
      toast.error('Una columna fue eliminada.');
    }
  }, [removeColumn]);

  useEffect(() => {
    // Actualizar la referencia cuando el store cambie
    const unsubscribe = useBoardStore.subscribe((state) => {
      storeRef.current = state;
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Evitar múltiples conexiones
    if (isConnectedRef.current || socket.connected) {
      return;
    }

    // Conectar socket
    socket.connect();

    // Registrar event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('columnCreated', handleColumnCreated);
    socket.on('cardCreated', handleCardCreated);
    socket.on('cardUpdated', handleCardUpdated);
    socket.on('cardMoved', handleCardMoved);
    socket.on('cardDeleted', handleCardDeleted);
    socket.on('columnDeleted', handleColumnDeleted);
    socket.on('columnUpdated', handleColumnUpdated);

    return () => {
      // Remover event listeners
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('columnCreated', handleColumnCreated);
      socket.off('cardCreated', handleCardCreated);
      socket.off('cardUpdated', handleCardUpdated);
      socket.off('cardMoved', handleCardMoved);
      socket.off('cardDeleted', handleCardDeleted);
      socket.off('columnDeleted', handleColumnDeleted);
      socket.off('columnUpdated', handleColumnUpdated)
    };
  }, [handleConnect, handleDisconnect, handleColumnCreated, handleCardCreated, handleCardUpdated, handleCardMoved, handleCardDeleted, handleColumnDeleted, handleColumnUpdated]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (socket.connected) {
        socket.disconnect();
        isConnectedRef.current = false;
      }
    };
  }, []);
};
