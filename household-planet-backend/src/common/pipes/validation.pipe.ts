import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = this.extractErrorMessages(errors);
        return new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      },
    });
  }

  private extractErrorMessages(errors: ValidationError[]): string[] {
    return errors.reduce((messages, error) => {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }
      if (error.children && error.children.length > 0) {
        messages.push(...this.extractErrorMessages(error.children));
      }
      return messages;
    }, []);
  }
}
