// src/api/cards/cards.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

@Controller('api/cards')
export class CardsController {
  private readonly logger = new Logger(CardsController.name);

  constructor(private readonly cardsService: CardsService) {
    console.log('✅ CardsController inicializado');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }

  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardsService.update(id, updateCardDto);
  }

  @Patch(':id/move')
  async moveCard(
    @Param('id') cardId: string,
    @Body() moveCardDto: MoveCardDto,
  ) {
    this.logger.log(`Recibido movimiento de tarjeta: ${cardId}`);
    this.logger.log(`Datos recibidos:`, moveCardDto);
    const updatedCard = await this.cardsService.move(cardId, moveCardDto);
    this.logger.log(`Movimiento procesado: ${updatedCard.id}`);
    return updatedCard;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.cardsService.remove(id);
  }
}
