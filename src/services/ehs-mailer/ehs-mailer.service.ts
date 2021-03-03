import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AuditHead } from 'src/modules/audits/audit.entity';



@Injectable()
export class EhsMailerService {
    constructor(private readonly mailerService: MailerService) {}
    public example(): void {
    
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";
        this
          .mailerService
          .sendMail({
            to: 'raul.ranete@gmail.com',
            from: 'nu-raspunde@ehs-focus.ro',
            subject: 'Testing Nest Mailermodule with template ✔',
            template: 'submited-email'
            // html: '<h1>Example</h1>', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
            // template: 
            // context: {  // Data to be sent to template engine.
            //   code: 'cf1a3f828287',
            //   username: 'john doe',
            // },
          })
          .then((e) => {
              console.log('then ', e);
          })
          .catch((e) => console.log('errpr ', e));
      }
     'src/email-teamplates/submited-email'
    public sendToEmail(email: string, subject: string, audit: AuditHead, status: string): void {
        if(!email) {
          return;
        }
        if(!this.validateEmail(email)) {
          return;
        }
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";
        this
        .mailerService
        .sendMail({
          to: 'raul.ranete@gmail.com',
          from: 'nu-raspunde@ehs-focus.ro',
          subject: subject || 'Testing Nest Mailermodule with template ✔',
          template: 'submited-email',
          context: {
            audit: audit,
             status: status || '',
             name:`${audit.employee.firstName} ${audit.employee.lastName}`,
            data:audit.createdDate
         },
        })
        .then((e) => {
            console.log('then ', e);
        })
        .catch((e) => console.log('error ', e));
        }
      
      validateEmail(email) {
          const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(email);
        }
        
}
