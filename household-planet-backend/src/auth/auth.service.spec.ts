import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from './enums/user-role.enum';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userSession: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    phoneVerificationToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    loginAttempt: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        name: 'John Doe',
        role: UserRole.CUSTOMER,
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
      });

      const result = await service.register(registerDto, '127.0.0.1', 'test-agent');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('message');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        service.register(registerDto, '127.0.0.1', 'test-agent')
      ).rejects.toThrow('User already exists');
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);

      const mockUser = {
        id: 1,
        email,
        password: hashedPassword,
        isActive: true,
        lockedUntil: null,
        loginAttempts: 0,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(email, password, '127.0.0.1', 'test-agent');

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.password).toBeUndefined();
    });

    it('should throw error for invalid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword', '127.0.0.1', 'test-agent')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
