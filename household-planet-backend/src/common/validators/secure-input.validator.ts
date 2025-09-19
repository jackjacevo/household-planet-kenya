import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsSecureInput(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSecureInput',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return true;
          
          // Check for common XSS patterns
          const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /<link/gi,
            /<meta/gi
          ];
          
          return !xssPatterns.some(pattern => pattern.test(value));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains potentially unsafe content`;
        }
      }
    });
  };
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return strongPasswordRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be at least 8 characters long and contain uppercase, lowercase, number, and special character`;
        }
      }
    });
  };
}
