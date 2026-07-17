import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserDTO } from '../users/dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'bson';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId -> socketId[]
  private userSockets: Map<string | ObjectId, Set<string>> = new Map();
  private onlineUsers: Map<string | ObjectId, UserDTO> = new Map(); // userId -> user

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      if (!token) return client.disconnect();

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOneUser('id', payload.userId);
      if (!user) return client.disconnect();

      const safeUser = plainToInstance(UserDTO, user, {
        excludeExtraneousValues: true,
      });

      // ✅ If user already connected from another tab, just add new socket
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
        this.onlineUsers.set(user.id, safeUser);
      }
      this.userSockets.get(user.id)!.add(client.id);

      // 👇 Broadcast user count (unique users)
      this.server.emit('userCount', this.onlineUsers.size);

      console.log(`✅ User connected: ${user.email}`);
      console.log('👥 Online users:', this.onlineUsers.size);
    } catch (err) {
      console.log('❌ Socket connection failed', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);

        // 🧹 If no more sockets for this user, remove user from online list
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          this.onlineUsers.delete(userId);
        }
        break;
      }
    }

    // 👇 Broadcast updated unique user count
    this.server.emit('userCount', this.onlineUsers.size);
    console.log('👥 Online users:', this.onlineUsers.size);
  }

  // 📨 Broadcast message to everyone
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { message: string; from: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sender = [...this.onlineUsers.values()].find((u) =>
      this.userSockets.get(u.id)?.has(client.id),
    );

    if (!sender) return;

    this.server.emit('message', {
      message: data.message,
      from: sender,
    });
  }
}
