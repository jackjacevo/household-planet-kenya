import { UserRole } from '../../common/enums';
export declare class RegisterDto {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: UserRole;
    dateOfBirth?: string;
    gender?: string;
}
