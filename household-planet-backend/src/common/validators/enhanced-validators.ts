import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsKenyanPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isKenyanPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Allow optional
          
          // Normalize phone number
          let phoneNumber = value.replace(/[\s\-]/g, '');
          if (phoneNumber.startsWith('07')) {
            phoneNumber = '+254' + phoneNumber.substring(1);
          } else if (phoneNumber.startsWith('7')) {
            phoneNumber = '+254' + phoneNumber;
          } else if (phoneNumber.startsWith('254')) {
            phoneNumber = '+' + phoneNumber;
          }
          
          // Validate normalized phone number
          const kenyanPhoneRegex = /^\+254[17]\d{8}$/;
          return kenyanPhoneRegex.test(phoneNumber);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Kenyan phone number (+254XXXXXXXXX, 254XXXXXXXXX, 07XXXXXXXX, or 7XXXXXXXX)`;
        }
      }
    });
  };
}

export function IsPositiveNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPositiveNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'number' && value > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a positive number`;
        }
      }
    });
  };
}

export function IsValidSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true;
          const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
          return slugRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid slug (lowercase letters, numbers, and hyphens only)`;
        }
      }
    });
  };
}
