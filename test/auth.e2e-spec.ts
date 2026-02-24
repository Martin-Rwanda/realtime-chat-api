import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/shared/filters/http-exception.filter';
import { DataSource } from 'typeorm';

interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      username: string;
    };
  };
}

interface RegisterResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    username: string;
  };
}

interface UserResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    status: string;
    passwordHash?: string;
  };
}

interface ErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.query('TRUNCATE TABLE refresh_tokens CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'e2etest@example.com',
          username: 'e2etest',
          password: 'StrongPass123!',
        })
        .expect(201);

      const body = response.body as RegisterResponse;
      expect(body.success).toBe(true);
      expect(body.data.email).toBe('e2etest@example.com');
    });

    it('should fail with duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'e2etest@example.com',
          username: 'e2etest2',
          password: 'StrongPass123!',
        })
        .expect(409);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          username: 'testuser',
          password: 'StrongPass123!',
        })
        .expect(400);
    });

    it('should fail with weak password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test2@example.com',
          username: 'testuser2',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'e2etest@example.com',
          password: 'StrongPass123!',
        })
        .expect(200);

      const body = response.body as AuthResponse;
      expect(body.success).toBe(true);
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();

      accessToken = body.data.accessToken;
      refreshToken = body.data.refreshToken;
    });

    it('should fail with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'e2etest@example.com',
          password: 'WrongPassword!',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'StrongPass123!',
        })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const body = response.body as AuthResponse;
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('GET /users/me', () => {
    it('should get current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = response.body as UserResponse;
      expect(body.data.email).toBe('e2etest@example.com');
      expect(body.data.passwordHash).toBeUndefined();
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });
  });
});