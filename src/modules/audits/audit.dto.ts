import { AuditHead } from './audit.entity';
import { Aspect } from 'src/modules/audits/audit_aspect/aspect.entity';



export class AuditDto {
    auditHead: AuditHead;
    aspects?: any;
    positiveAspects: Aspect[];
    negativeAspects: Aspect[];
}