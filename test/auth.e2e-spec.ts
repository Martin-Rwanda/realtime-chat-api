import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/shared/filters/http-exception.filter';
import { DataSource } from 'typeorm';

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
    // Clean up test data
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

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('e2etest@example.com');
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

      expect(response.body.success).toBe(false);
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

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      accessToken = response.body.data.accessToken as string;
      refreshToken = response.body.data.refreshToken as string;
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

      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
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

      expect(response.body.data.email).toBe('e2etest@example.com');
      expect(response.body.data.passwordHash).toBeUndefined();
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });
  });
});