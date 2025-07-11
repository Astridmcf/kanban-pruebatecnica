import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KanbanGateway } from '../../realtime/kanban/kanban.gateway';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { Card } from '../../types/kanban.types';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kanbanGateway: KanbanGateway,
  ) {}

  async findAll(): Promise<Card[]> {
    try {
      return await this.prisma.card.findMany({
        orderBy: [{ columnId: 'asc' }, { order: 'asc' }],
      });
    } catch (error) {
      this.logger.error('Error fetching all cards', error);
      throw new BadRequestException('Failed to fetch cards');
    }
  }

  async findOne(id: string): Promise<Card> {
    try {
      const card = await this.prisma.card.findUnique({
        where: { id },
      });

      if (!card) {
        throw new NotFoundException(`Card with ID ${id} not found`);
      }

      return card;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching card with ID ${id}`, error);
      throw new BadRequestException('Failed to fetch card');
    }
  }

  async create(createCardDto: CreateCardDto): Promise<Card> {
    try {
      const columnExists = await this.prisma.column.findUnique({
        where: { id: createCardDto.columnId },
      });
      if (!columnExists) {
        throw new NotFoundException(
          `Column with ID ${createCardDto.columnId} not found`,
        );
      }
      const maxOrderCard = await this.prisma.card.findFirst({
        where: { columnId: createCardDto.columnId },
        orderBy: { order: 'desc' },
      });
      const newOrder = maxOrderCard ? maxOrderCard.order + 1 : 1;
      const newCard = await this.prisma.card.create({
        data: { ...createCardDto, order: newOrder },
      });
      this.kanbanGateway.emitCardCreated(newCard);
      this.logger.log(`Card created successfully: ${newCard.id}`);
      return newCard;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error creating card', error);
      throw new BadRequestException('Failed to create card');
    }
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    try {
      await this.findOne(id);
      const updatedCard = await this.prisma.card.update({
        where: { id },
        data: updateCardDto,
      });
      this.kanbanGateway.emitCardUpdated(updatedCard);
      this.logger.log(`Card updated successfully: ${id}`);
      return updatedCard;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error updating card with ID ${id}`, error);
      throw new BadRequestException('Failed to update card');
    }
  }

  // --- MÉTODO 'move' COMPLETAMENTE CORREGIDO ---
  async move(cardId: string, moveDto: MoveCardDto): Promise<Card> {
    const { newColumnId, newOrder } = moveDto;

    try {
      const movedCard = await this.prisma.$transaction(async (tx) => {
        const cardToMove = await tx.card.findUnique({ where: { id: cardId } });

        if (!cardToMove) {
          throw new NotFoundException(`Card with ID ${cardId} not found`);
        }

        const { columnId: sourceColumnId, order: sourceOrder } = cardToMove;

        // CASO 1: La tarjeta se mueve dentro de la misma columna
        if (sourceColumnId === newColumnId) {
          if (sourceOrder === newOrder) return cardToMove; // No hay cambio

          if (sourceOrder < newOrder) {
            // Mover hacia abajo: las tarjetas en medio suben de posición
            await tx.card.updateMany({
              where: {
                columnId: sourceColumnId,
                order: { gt: sourceOrder, lte: newOrder },
              },
              data: { order: { decrement: 1 } },
            });
          } else {
            // sourceOrder > newOrder
            // Mover hacia arriba: las tarjetas en medio bajan de posición
            await tx.card.updateMany({
              where: {
                columnId: sourceColumnId,
                order: { gte: newOrder, lt: sourceOrder },
              },
              data: { order: { increment: 1 } },
            });
          }
        }
        // CASO 2: La tarjeta se mueve a una columna diferente
        else {
          // Cerrar el hueco en la columna de origen
          await tx.card.updateMany({
            where: { columnId: sourceColumnId, order: { gt: sourceOrder } },
            data: { order: { decrement: 1 } },
          });

          // Crear espacio en la columna de destino
          await tx.card.updateMany({
            where: { columnId: newColumnId, order: { gte: newOrder } },
            data: { order: { increment: 1 } },
          });
        }

        // Finalmente, actualizar la tarjeta a su nueva posición y columna
        const updatedCard = await tx.card.update({
          where: { id: cardId },
          data: { columnId: newColumnId, order: newOrder },
        });

        this.logger.log(
          `Card ${cardId} moved to column ${newColumnId}, position ${newOrder}`,
        );

        return updatedCard;
      });

      // 5. Emitir el evento WebSocket para notificar a todos los clientes
      this.kanbanGateway.emitCardMoved(movedCard);

      return movedCard;
    } catch (error) {
      this.logger.error(
        `Failed to move card ${cardId}:`,
        error instanceof Error ? error.message : String(error),
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to move card');
    }
  }

  async remove(cardId: string): Promise<{ message: string }> {
    try {
      const cardToDelete = await this.prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!cardToDelete) {
        throw new NotFoundException(`Card with ID ${cardId} not found`);
      }

      await this.prisma.$transaction(async (tx) => {
        // Eliminar la tarjeta
        await tx.card.delete({
          where: { id: cardId },
        });

        // Reorganizar el orden de las tarjetas restantes
        await tx.card.updateMany({
          where: {
            columnId: cardToDelete.columnId,
            order: { gt: cardToDelete.order },
          },
          data: { order: { decrement: 1 } },
        });
      });

      this.kanbanGateway.emitCardDeleted(cardId);
      this.logger.log(`Card deleted successfully: ${cardId}`);

      return { message: 'Card deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting card ${cardId}`, error);
      throw new BadRequestException('Failed to delete card');
    }
  }
}
