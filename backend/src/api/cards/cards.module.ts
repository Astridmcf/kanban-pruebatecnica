// Archivo a modificar: src/api/cards/cards.module.ts

import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { RealtimeModule } from '../../realtime/realtime.module'; // <-- 1. Importa RealtimeModule

@Module({
  imports: [RealtimeModule], // <-- 2. Añade RealtimeModule a los imports
  controllers: [CardsController],
  providers: [CardsService], // <-- 3. Elimina KanbanGateway de aquí
  exports: [CardsService],
})
export class CardsModule {}
