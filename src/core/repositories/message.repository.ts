import { Message, MessageRead } from '../entities/message.entity';
import { MessageType } from 'src/shared/enum/message-type.enum';

export interface ICreateMessageInput {
    roomId: string;
    senderId: string;
    content: string;
    type: MessageType;
}

export interface IGetMessagesInput {
    roomId: string;
    limit: number;
    cursor?: string; // message id to paginate from
}

export interface IMessageRepository {
    create(input: ICreateMessageInput): Promise<Message>;
    findById(id: string): Promise<Message | null>;
    findByRoom(input: IGetMessagesInput): Promise<Message[]>;
    update(id: string, data: Partial<Message>): Promise<Message>;
    markAsRead(messageId: string, userId: string): Promise<MessageRead>;
    findRead(messageId: string, userId: string): Promise<MessageRead | null>;
}

export const MESSAGE_REPOSITORY = 'MESSAGE_REPOSITORY';