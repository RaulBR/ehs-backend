import { User } from "src/modules/user/user.entity";

export interface CustomRequest extends Request {
    user?: User;
}