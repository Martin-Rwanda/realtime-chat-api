import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../entities/message.orm-entity';
import { MessageReadOrmEntity } from '../entities/message-read.orm-entity';
import {
  IMessageRepository,
  ICreateMessageInput,
  IGetMessagesInput,
} from '../../../../core/repositories/message.repository';
import { Message, MessageRead } from '../../../../core/entities/message.entity';

@Injectable()
export class MessageRepositoryImpl implements IMessageRepository {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepo: Repository<MessageOrmEntity>,
    @InjectRepository(MessageReadOrmEntity)
    private readonly readRepo: Repository<MessageReadOrmEntity>,
  ) {}

  async create(input: ICreateMessageInput): Promise<Message> {
    const entity = this.messageRepo.create(input);
    const saved = await this.messageRepo.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Message | null> {
    const entity = await this.messageRepo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByRoom(input: IGetMessagesInput): Promise<Message[]> {
    const query = this.messageRepo
      .createQueryBuilder('message')
      .where('message.room_id = :roomId', { roomId: input.roomId })
      .orderBy('message.created_at', 'DESC')
      .take(input.limit);

    // Cursor-based pagination — get messages older than cursor
    if (input.cursor) {
      const cursorMessage = await this.messageRepo.findOne({
        where: { id: input.cursor },
      });
      if (cursorMessage) {
        query.andWhere('message.created_at < :cursorDate', {
          cursorDate: cursorMessage.createdAt,
        });
      }
    }

    const entities = await query.getMany();
    return entities.map(this.toDomain);
  }

  async update(id: string, data: Partial<Message>): Promise<Message> {
    await this.messageRepo.update(id, data);
    const updated = await this.messageRepo.findOne({ where: { id } });
    return this.toDomain(updated!);
  }

  async markAsRead(messageId: string, userId: string): Promise<MessageRead> {
    const entity = this.readRepo.create({ messageId, userId });
    const saved = await this.readRepo.save(entity);
    return this.toDomainRead(saved);
  }

  async findRead(messageId: string, userId: string): Promise<MessageRead | null> {
    const entity = await this.readRepo.findOne({
      where: { messageId, userId },
    });
    return entity ? this.toDomainRead(entity) : null;
  }

  private toDomain = (entity: MessageOrmEntity): Message => {
    const message = new Message();
    message.id = entity.id;
    message.roomId = entity.roomId;
    message.senderId = entity.senderId;
    message.content = entity.content;
    message.type = entity.type;
    message.isEdited = entity.isEdited;
    message.isDeleted = entity.isDeleted;
    message.createdAt = entity.createdAt;
    message.updatedAt = entity.updatedAt;
    return message;
  };

  private toDomainRead = (entity: MessageReadOrmEntity): MessageRead => {
    const read = new MessageRead();
    read.id = entity.id;
    read.messageId = entity.messageId;
    read.userId = entity.userId;
    read.readAt = entity.readAt;
    return read;
  };
}