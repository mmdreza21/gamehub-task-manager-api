import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NoteModule } from 'src/note/note.module';
import { ObjectId } from 'bson';
import { NoteService } from 'src/note/note.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockRepository = {
    // Simple sugar function for: jest.fn().mockImplementation(() => Promise.resolve(value));
    create: jest.fn().mockResolvedValue({
      id: new ObjectId(),
      title: 'Test Note',
      content: 'Hello world',
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NoteModule],
    })
      .overrideProvider(NoteService)
      .useValue(mockRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/notes (POST) should create a note', async () => {
    const res = await request(app.getHttpServer())
      .post('/notes')
      .send({ title: 'Test Note', content: 'Hello world' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Note');
  });
  afterAll(async () => {
    await app.close();
  });
});
