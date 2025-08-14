import 'express-session';
import { JwtUser } from './user.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtUser;
    session?: {
      id?: string;
      [key: string]: any;
    };
  }
}