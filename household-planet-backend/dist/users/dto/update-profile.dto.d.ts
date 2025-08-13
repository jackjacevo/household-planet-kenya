import { AddressType } from '../../common/enums';
export declare class UpdateProfileDto {
    name?: string;
    phone?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: string;
}
export declare class AddAddressDto {
    type: AddressType;
    fullName: string;
    phone: string;
    county: string;
    town: string;
    street: string;
    landmark?: string;
    isDefault?: boolean;
}
