import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KanbanGateway } from '../../realtime/kanban/kanban.gateway';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { Column } from '../../types/kanban.types';

@Injectable()
export class ColumnsService {
  private readonly logger = new Logger(ColumnsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kanbanGateway: KanbanGateway,
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<Column> {
    try {
      // Verificar si ya existe una columna con el mismo título
      const existingColumn = await this.prisma.column.findFirst({
        where: { title: createColumnDto.title },
      });

      if (existingColumn) {
        throw new BadRequestException(
          `Column with title "${createColumnDto.title}" already exists`,
        );
      }

      // Obtener el siguiente orden
      const maxOrderColumn = await this.prisma.column.findFirst({
        orderBy: { order: 'desc' },
      });
      const newOrder = maxOrderColumn ? maxOrderColumn.order + 1 : 1;

      const newColumn = await this.prisma.column.create({
        data: {
          ...createColumnDto,
          order: newOrder,
        },
        include: {
          cards: {
            orderBy: { order: 'asc' },
          },
        },
      });

      this.kanbanGateway.emitColumnCreated(newColumn);
      this.logger.log(`Column created successfully: ${newColumn.id}`);

      return newColumn;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error creating column', error);
      throw new BadRequestException('Failed to create column');
    }
  }

  async findAll(): Promise<Column[]> {
    try {
      return await this.prisma.column.findMany({
        include: {
          cards: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      });
    } catch (error) {
      this.logger.error('Error fetching all columns', error);
      throw new BadRequestException('Failed to fetch columns');
    }
  }

  async findOne(id: string): Promise<Column> {
    try {
      const column = await this.prisma.column.findUnique({
        where: { id },
        include: {
          cards: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!column) {
        throw new NotFoundException(`Column with ID ${id} not found`);
      }

      return column;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching column with ID ${id}`, error);
      throw new BadRequestException('Failed to fetch column');
    }
  }

  async update(id: string, updateColumnDto: UpdateColumnDto): Promise<Column> {
    try {
      const existingColumn = await this.prisma.column.findUnique({
        where: { id },
      });

      if (!existingColumn) {
        throw new NotFoundException(`Column with ID ${id} not found`);
      }

      // Verificar si el nuevo título ya existe (si se está actualizando)
      if (
        updateColumnDto.title &&
        updateColumnDto.title !== existingColumn.title
      ) {
        const duplicateColumn = await this.prisma.column.findFirst({
          where: {
            title: updateColumnDto.title,
            id: { not: id },
          },
        });

        if (duplicateColumn) {
          throw new BadRequestException(
            `Column with title "${updateColumnDto.title}" already exists`,
          );
        }
      }

      const updatedColumn = await this.prisma.column.update({
        where: { id },
        data: updateColumnDto,
        include: {
          cards: {
            orderBy: { order: 'asc' },
          },
        },
      });

      this.kanbanGateway.emitColumnUpdated(updatedColumn);
      this.logger.log(`Column updated successfully: ${id}`);

      return updatedColumn;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error updating column with ID ${id}`, error);
      throw new BadRequestException('Failed to update column');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const columnToDelete = await this.prisma.column.findUnique({
        where: { id },
        include: { cards: true },
      });

      if (!columnToDelete) {
        throw new NotFoundException(`Column with ID ${id} not found`);
      }

      // Verificar si la columna tiene tarjetas
      if (columnToDelete.cards.length > 0) {
        throw new BadRequestException(
          `Cannot delete column "${columnToDelete.title}" because it contains ${columnToDelete.cards.length} card(s). Please move or delete the cards first.`,
        );
      }

      await this.prisma.$transaction(async (tx) => {
        // Eliminar la columna
        await tx.column.delete({
          where: { id },
        });

        // Reorganizar el orden de las columnas restantes
        await tx.column.updateMany({
          where: {
            order: { gt: columnToDelete.order },
          },
          data: { order: { decrement: 1 } },
        });
      });

      this.kanbanGateway.emitColumnDeleted(id);
      this.logger.log(`Column deleted successfully: ${id}`);

      return { message: 'Column deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error deleting column ${id}`, error);
      throw new BadRequestException('Failed to delete column');
    }
  }

  async moveColumn(id: string, newOrder: number): Promise<Column> {
    if (newOrder < 1) {
      throw new BadRequestException('Order must be greater than 0');
    }

    try {
      const updatedColumn = await this.prisma.$transaction(async (tx) => {
        const columnToMove = await tx.column.findUnique({ where: { id } });

        if (!columnToMove) {
          throw new NotFoundException(`Column with ID ${id} not found`);
        }

        const oldOrder = columnToMove.order;

        // Si es el mismo orden, no hacer nada
        if (oldOrder === newOrder) {
          return columnToMove;
        }

        // Reorganizar otras columnas
        if (newOrder < oldOrder) {
          await tx.column.updateMany({
            where: {
              order: { gte: newOrder, lt: oldOrder },
            },
            data: { order: { increment: 1 } },
          });
        } else {
          await tx.column.updateMany({
            where: {
              order: { gt: oldOrder, lte: newOrder },
            },
            data: { order: { decrement: 1 } },
          });
        }

        // Actualizar la columna movida
        const movedColumn = await tx.column.update({
          where: { id },
          data: { order: newOrder },
          include: {
            cards: {
              orderBy: { order: 'asc' },
            },
          },
        });

        return movedColumn;
      });

      this.kanbanGateway.emitColumnUpdated(updatedColumn);
      this.logger.log(
        `Column moved successfully: ${id} to position ${newOrder}`,
      );

      return updatedColumn;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error moving column ${id}`, error);
      throw new BadRequestException('Failed to move column');
    }
  }

  async getBoardState(): Promise<{ columns: Column[] }> {
    try {
      const columns = await this.findAll();
      return { columns };
    } catch (error) {
      this.logger.error('Error fetching board state', error);
      throw new BadRequestException('Failed to fetch board state');
    }
  }
}
