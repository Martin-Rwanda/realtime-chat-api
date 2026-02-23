import { MessageType } from "src/shared/enum/message-type.enum";
export class Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: MessageType;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MessageRead {
  id: string;
  messageId: string;
  userId: string;
  readAt: Date;
}