// src/realtime/realtime.module.ts
import { Module } from '@nestjs/common';
import { KanbanGateway } from './kanban/kanban.gateway';

@Module({
  providers: [KanbanGateway],
  exports: [KanbanGateway], // Asegúrate de exportar el gateway
})
export class RealtimeModule {}
