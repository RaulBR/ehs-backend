import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import * as redisIoAdapter from 'socket.io-redis';



export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    const redisAdapter = redisIoAdapter({ host: process.env.CASH_HOST, port: parseInt(process.env.CASH_PORT,10) });
    server.adapter(redisAdapter);
    return server;
  }
}