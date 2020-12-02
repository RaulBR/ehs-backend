import { AuditHead } from "src/modules/audits/audit.entity";
import { Aspect } from "./aspect.entity";

export interface AspectCrudRequest {
    auditHead: AuditHead;
    aspect: Aspect;
}