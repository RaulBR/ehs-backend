import { Injectable } from "@nestjs/common";
import { PaginationObject } from "src/models/request.model";

@Injectable()
export class UtilsService  {
    removeNullProperty(propertyList: string, object: any): any {
        if (!object || !propertyList) {
            return object;
        }
        if (propertyList in object && !object[propertyList]) {
            delete object[propertyList]
        }

        return object;
    }

    getRows(rows: PaginationObject): PaginationObject {
        const defaultPagination = {
            fromRow: 0,
            toRow: 20
        }

        if (!rows || (!rows.fromRow && !rows.toRow)) {
            return defaultPagination;
        }

        let from = rows.fromRow;
        let to = rows.toRow;
        if (from < 0) {
            from = 0;
        }
        if (to < from) {
            to = from + 20;
        }
        const diff = to - from;
        if (diff < 0) {
            return defaultPagination;
        }
        if (diff > 50) {
            return {
                fromRow: from,
                toRow: from + 50,
            };
        }
        return {
            fromRow: from,
            toRow: to,
        };


    }



    
}
