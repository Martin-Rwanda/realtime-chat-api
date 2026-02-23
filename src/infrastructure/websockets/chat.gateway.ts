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

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Map of userId → socketId (track online users)
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(RoomMemberOrmEntity)
    private readonly memberRepo: Repository<RoomMemberOrmEntity>,
  ) {}

  // ─── Connection ────────────────────────────────────────────────
  async handleConnection(client: Socket): Promise<void> {
    try {
      const payload = this.extractPayload(client);
      if (!payload) {
        client.disconnect();
        return;
      }

      const userId = payload.sub;

      // Store connection
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;
      client.data.username = payload.username;

      // Update user status to online
      await this.userRepo.update(userId, { status: UserStatus.ONLINE });

      // Auto-join all rooms the user is a member of
      const memberships = await this.memberRepo.find({
        where: { userId },
      });

      for (const membership of memberships) {
        await client.join(membership.roomId);
      }

      // Notify others that user is online
      this.server.emit('user:online', {
        userId,
        username: payload.username,
      });

      this.logger.log(`Client connected: ${payload.username} (${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  // ─── Disconnection ─────────────────────────────────────────────
  async handleDisconnect(client: Socket): Promise<void> {
    const userId = client.data.userId as string;
    if (!userId) return;

    this.connectedUsers.delete(userId);

    // Update user status to offline
    await this.userRepo.update(userId, { status: UserStatus.OFFLINE });

    // Notify others
    this.server.emit('user:offline', {
      userId,
      username: client.data.username,
    });

    this.logger.log(`Client disconnected: ${client.data.username} (${client.id})`);
  }

  // ─── Typing Indicators ─────────────────────────────────────────
  @SubscribeMessage('user:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ): void {
    client.to(data.roomId).emit('user:typing', {
      userId: client.data.userId,
      username: client.data.username,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('user:stop-typing')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ): void {
    client.to(data.roomId).emit('user:stop-typing', {
      userId: client.data.userId,
      username: client.data.username,
      roomId: data.roomId,
    });
  }

  // ─── Public methods (called from HTTP controllers) ──────────────
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

  // Add socket to room when user joins
  async addUserToRoom(userId: string, roomId: string): Promise<void> {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) await socket.join(roomId);
    }
  }

  // Remove socket from room when user leaves
  async removeUserFromRoom(userId: string, roomId: string): Promise<void> {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) socket.leave(roomId);
    }
  }

  // ─── JWT extraction ────────────────────────────────────────────
  private extractPayload(client: Socket): JwtPayload | null {
    try {
      const token =
        client.handshake.auth.token as string ||
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