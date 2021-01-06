import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';


import { Logger, UseGuards } from '@nestjs/common';
import { Socket, Server, Client } from 'socket.io';
import { SocketAuth } from 'src/auth/socket.auth';
import { AuditsService } from './audits.service';
import { AuditHead } from './audit.entity';
import { CashingService } from 'src/services/cashe.service';
import { User } from '../user/user.entity';

@WebSocketGateway({
  namespace: 'ws',
  middlewares: [SocketAuth],
})

export class AuditGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly auditService: AuditsService,
    private readonly cashingService: CashingService,
  ) { };
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('AuditGateway');
  @UseGuards(SocketAuth)
  async handleConnection(client: Socket, ...args: any[]) {
    //console.log(client,args);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server): void {
    this.logger.log('Init');
  }


  @SubscribeMessage('submitAudit')
  @UseGuards(SocketAuth)
  async submitaudit(client: Client, data: AuditHead): Promise<AuditHead> {
    const userEmails = await this.auditService.submitAudit(data, client['user']);
    this.emitTo(userEmails);
    userEmails.forEach(element => {
      this.server.emit('submitAudit', element);
    });

    this.server.emit('identity', userEmails);
    return data;
  }

  @SubscribeMessage('auditsFromMyArea')
  @UseGuards(SocketAuth)
  async emit(client?: Client): Promise<void> {
    const number = await this.auditService.getNumberOfAuditsTobeDistribuied(client['user']);
    this.server.to(client.id).emit('auditsFromMyArea', number);
  }

  @SubscribeMessage('myResponsibillity')
  @UseGuards(SocketAuth)
  async emitResponsibilityes(client?: Client): Promise<void> {
    const number = await this.auditService.getMyReponsabilittyAspectsNumber(client['user']);
    this.server.to(client.id).emit('myResponsibillity', number);
  }

  @SubscribeMessage('myResponsibillity')
  @UseGuards(SocketAuth)
  async emitMyRejectedAspects(client?: Client): Promise<void> {
    const number = await this.auditService.getMyRejectedAspectsNumber(client['user']);
    this.server.to(client.id).emit('myRejectedAspects', number);
  }


  emitTo(emailList: string[]) {
    const list = [];
    emailList.forEach(eamil => {
      list.push(this.emitAuditisToDistributeForUser(eamil));
    });
    Promise.all(emailList);
  }

  async emitAuditisToDistributeForUser(email: string): Promise<void> {
    const socket = await this.cashingService.getValue(email);
    if (socket) {
      const number = await this.auditService.getNumberOfAuditsTobeDistribuied({ email: email });
      this.server.to(socket).emit('auditsFromMyArea', number);
    }
  }
  async emitMyReponsabilittyAspectsForUser(email: string): Promise<void> {
    const socket = await this.cashingService.getValue(email);


    if (socket) {
      const number = await this.auditService.getMyReponsabilittyAspectsNumber({ email: email });
      this.server.to(socket).emit('myResponsibillity', number);
    }
  }

  async emitMyRejectedAspectsForUser(email: string) {
    const socket = await this.cashingService.getValue(email);
    if (socket) {
      const number = await this.auditService.getMyRejectedAspectsNumber({ email: email });
      this.server.to(socket).emit('myRejectedAspects', number);
    }
}
  @SubscribeMessage('getAll')
  @UseGuards(SocketAuth)
  async getAll(client: Client): Promise<void> {
    await this.emitResponsibilityes(client);
    await this.emit(client);
    const user: User = client['user']
    await this.emitMyRejectedAspectsForUser(user.email);
  }
}


