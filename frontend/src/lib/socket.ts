import { io } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SOCKET_URL = `${URL}/kanban`;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  // Optimizaciones para evitar reconexiones
  forceNew: false, // Cambiar a false para reutilizar conexiones
  transports: ['websocket'],
  upgrade: false,
  rememberUpgrade: false,
  // Configuraciones de reconexión más estables
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
});
