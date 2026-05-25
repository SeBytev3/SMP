import { prismaMock } from '../prisma.mock';
import { authService } from '../../src/services/auth.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('token'),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  const registerData = {
    email: 'test@test.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER' as const,
  };

  beforeEach(() => {
    process.env.JWT_SECRET = 'secret';
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ id: 'u1', ...registerData, languagePref: 'es' } as any);

      const result = await authService.register(registerData);
      expect(result.user.id).toBe('u1');
      expect(result.token).toBe('token');
    });

    it('should throw if email taken', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' } as any);
      await expect(authService.register(registerData)).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return user and token', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: 'hash',
        languagePref: 'es',
        loginAttempts: 0,
        lockoutUntil: null,
      } as any);
      const result = await authService.login({ email: 'test@test.com', password: 'password' });
      expect(result.token).toBe('token');
    });

    it('should throw if user is locked out', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in future
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: 'hash',
        languagePref: 'es',
        loginAttempts: 5,
        lockoutUntil: futureDate,
      } as any);

      await expect(
        authService.login({ email: 'test@test.com', password: 'password' })
      ).rejects.toThrow('Account is temporarily locked. Please try again later.');
    });

    it('should allow login if lockout has expired and reset attempts', async () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes in past
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: 'hash',
        languagePref: 'es',
        loginAttempts: 5,
        lockoutUntil: pastDate,
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      prismaMock.user.update.mockResolvedValue({} as any);

      const result = await authService.login({ email: 'test@test.com', password: 'password' });
      expect(result.token).toBe('token');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { loginAttempts: 0, lockoutUntil: null },
      });
    });

    it('should increment attempts on failed password', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: 'hash',
        languagePref: 'es',
        loginAttempts: 2,
        lockoutUntil: null,
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      prismaMock.user.update.mockResolvedValue({} as any);

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong' })
      ).rejects.toThrow('Invalid email or password');

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { loginAttempts: 3, lockoutUntil: null },
      });
    });

    it('should trigger lockout when failed attempts reach 5', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: 'hash',
        languagePref: 'es',
        loginAttempts: 4,
        lockoutUntil: null,
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      prismaMock.user.update.mockResolvedValue({} as any);

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong' })
      ).rejects.toThrow('Invalid email or password');

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          loginAttempts: 5,
          lockoutUntil: expect.any(Date),
        },
      });
    });
  });

  describe('verifyToken', () => {
    it('should return decoded with userId', () => {
      (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u1', role: 'ADMIN', lng: 'en' });
      const result = authService.verifyToken('valid');
      expect(result.userId).toBe('u1');
      expect(result.languagePref).toBe('en');
    });
  });
});
