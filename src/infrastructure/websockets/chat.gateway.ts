import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../database/typeorm/entities/user.orm-entity';
import { RoomMemberOrmEntity } from '../database/typeorm/entities/room-member.orm-entity';
import { UserStatus } from 'src/shared/enum/user-status.enum';

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

interface SocketData {
  userId: string;
  username: string;
}

type AuthenticatedSocket = Socket & { data: SocketData };

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(RoomMemberOrmEntity)
    private readonly memberRepo: Repository<RoomMemberOrmEntity>,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const payload = this.extractPayload(client);
      if (!payload) {
        client.disconnect();
        return;
      }

      const socket = client as AuthenticatedSocket;
      const userId = payload.sub;

      this.connectedUsers.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.username = payload.username;

      await this.userRepo.update(userId, { status: UserStatus.ONLINE });

      const memberships = await this.memberRepo.find({ where: { userId } });
      for (const membership of memberships) {
        await socket.join(membership.roomId);
      }

      this.server.emit('user:online', { userId, username: payload.username });
      this.logger.log(`Client connected: ${payload.username} (${socket.id})`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const socket = client as AuthenticatedSocket;
    const userId = socket.data.userId;
    const username = socket.data.username;
    if (!userId) return;

    this.connectedUsers.delete(userId);
    await this.userRepo.update(userId, { status: UserStatus.OFFLINE });
    this.server.emit('user:offline', { userId, username });
    this.logger.log(`Client disconnected: ${username} (${socket.id})`);
  }

  @SubscribeMessage('user:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ): void {
    const socket = client as AuthenticatedSocket;
    client.to(data.roomId).emit('user:typing', {
      userId: socket.data.userId,
      username: socket.data.username,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('user:stop-typing')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ): void {
    const socket = client as AuthenticatedSocket;
    client.to(data.roomId).emit('user:stop-typing', {
      userId: socket.data.userId,
      username: socket.data.username,
      roomId: data.roomId,
    });
  }

  emitNewMessage(roomId: string, message: unknown): void {
    this.server.to(roomId).emit('message:new', message);
  }

  emitEditedMessage(roomId: string, message: unknown): void {
    this.server.to(roomId).emit('message:edited', message);
  }

  emitDeletedMessage(roomId: string, messageId: string): void {
    this.server.to(roomId).emit('message:deleted', { messageId, roomId });
  }

  emitUserJoinedRoom(roomId: string, userId: string, username: string): void {
    this.server.to(roomId).emit('room:user-joined', { roomId, userId, username });
  }

  emitUserLeftRoom(roomId: string, userId: string, username: string): void {
    this.server.to(roomId).emit('room:user-left', { roomId, userId, username });
  }

  async addUserToRoom(userId: string, roomId: string): Promise<void> {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) await socket.join(roomId);
    }
  }

  removeUserFromRoom(userId: string, roomId: string): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        void socket.leave(roomId);
      }
    }
  }

  private extractPayload(client: Socket): JwtPayload | null {
    try {
      const token =
        (client.handshake.auth as { token?: string }).token ??
        client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) return null;
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });
    } catch {
      return null;
    }
  }
}