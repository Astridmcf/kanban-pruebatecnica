import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CardsModule } from './api/cards/cards.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ColumnsModule } from './api/columns/columns.module';

@Module({
  imports: [
    PrismaModule,
    RealtimeModule, // Asegúrate de que esté ANTES de los otros módulos
    CardsModule,
    ColumnsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
