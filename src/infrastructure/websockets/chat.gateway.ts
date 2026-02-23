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

        const userId = payload.sub;
        const username = payload.username;

        this.setSocketData(client, { userId, username });
        this.connectedUsers.set(userId, client.id);

        await this.userRepo.update({ id: userId }, { status: UserStatus.ONLINE });

        const memberships = await this.memberRepo.find({ where: { userId } });
        for (const membership of memberships) {
            await client.join(membership.roomId);
        }

        this.server.emit('user:online', { userId, username });
        this.logger.log(`Client connected: ${username} (${client.id})`);
        } catch {
        client.disconnect();
        }
    }

    async handleDisconnect(client: Socket): Promise<void> {
        const data = this.getSocketData(client);
        if (!data) return;

        const { userId, username } = data;
        this.connectedUsers.delete(userId);
        await this.userRepo.update({ id: userId }, { status: UserStatus.OFFLINE });
        this.server.emit('user:offline', { userId, username });
        this.logger.log(`Client disconnected: ${username} (${client.id})`);
    }

    @SubscribeMessage('user:typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string },
    ): void {
        const socketData = this.getSocketData(client);
        if (!socketData) return;
        client.to(data.roomId).emit('user:typing', {
        userId: socketData.userId,
        username: socketData.username,
        roomId: data.roomId,
        });
    }

    @SubscribeMessage('user:stop-typing')
    handleStopTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string },
    ): void {
        const socketData = this.getSocketData(client);
        if (!socketData) return;
        client.to(data.roomId).emit('user:stop-typing', {
        userId: socketData.userId,
        username: socketData.username,
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
        if (socket) void socket.leave(roomId);
        }
    }

    // ─── Helpers ───────────────────────────────────────────────────
    private setSocketData(client: Socket, data: SocketData): void {
        (client as Socket & { data: SocketData }).data = data;
    }

    private getSocketData(client: Socket): SocketData | null {
        const data = (client as Socket & { data: unknown }).data;
        if (
        data &&
        typeof data === 'object' &&
        'userId' in data &&
        'username' in data &&
        typeof (data as SocketData).userId === 'string' &&
        typeof (data as SocketData).username === 'string'
        ) {
        return data as SocketData;
        }
        return null;
    }

    private extractPayload(client: Socket): JwtPayload | null {
        try {
            const auth = client.handshake.auth as Record<string, unknown>;

            let token: string | undefined;

            if (typeof auth.token === 'string') {
            token = auth.token;
            } else if (typeof client.handshake.headers['authorization'] === 'string') {
                token = (client.handshake.headers['authorization'] as string).replace('Bearer ', '');
            }

            if (!token) return null;

            return this.jwtService.verify<JwtPayload>(token, {
                secret: this.configService.get<string>('jwt.accessSecret'),
            });
        } catch {
            return null;
        }
    }
}