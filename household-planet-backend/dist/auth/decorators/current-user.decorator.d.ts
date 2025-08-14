import { JwtUser } from '../../types/user.interface';
export declare const CurrentUser: (...dataOrPipes: (keyof JwtUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
