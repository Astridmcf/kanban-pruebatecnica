import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Card, Column, WebSocketEvent } from '../../types/kanban.types';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/kanban',
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KanbanGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private emitEvent<T>(eventType: string, data: T): void {
    const event: WebSocketEvent<T> = {
      type: eventType,
      data,
      timestamp: new Date(),
    };

    this.server.emit(eventType, event);
    this.logger.debug(`Event emitted: ${eventType}`, { data });
  }

  emitCardCreated(card: Card): void {
    this.emitEvent('cardCreated', card);
  }

  emitCardMoved(card: Card): void {
    this.emitEvent('cardMoved', card);
  }

  emitCardUpdated(card: Card): void {
    this.emitEvent('cardUpdated', card);
  }

  emitCardDeleted(cardId: string): void {
    this.emitEvent('cardDeleted', { cardId });
  }

  emitColumnCreated(column: Column): void {
    this.emitEvent('columnCreated', column);
  }

  emitColumnUpdated(column: Column): void {
    this.emitEvent('columnUpdated', column);
  }

  emitColumnDeleted(columnId: string): void {
    this.emitEvent('columnDeleted', { columnId });
  }

  emitBoardStateSync(board: { columns: Column[] }): void {
    this.emitEvent('boardStateSync', board);
  }
}
