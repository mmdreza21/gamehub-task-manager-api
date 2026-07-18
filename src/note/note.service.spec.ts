import { Test, TestingModule } from '@nestjs/testing';
import { NoteService } from './note.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ObjectId } from 'bson';

describe('NoteService', () => {
  let service: NoteService;

  const mockRepository = {
    create: jest.fn((dto) => {
      return Promise.resolve({ id: new ObjectId(), ...dto });
    }),
    findMany: jest.fn(() => {
      return [{ id: 'some-id', title: 'test', content: 'test' }];
    }),
    findUnique: jest.fn((dto) => {
      return { id: dto.where.id, title: 'test', content: 'test' };
    }),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        {
          provide: 'PrismaService',
          useValue: mockRepository,
        },
      ],
      imports: [PrismaModule],
    }).compile();

    service = module.get<NoteService>(NoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a note', async () => {
    const note = await mockRepository.create({
      title: 'test',
      content: 'test',
    });
    expect(note).toEqual({
      id: expect.any(ObjectId),
      title: 'test',
      content: 'test',
    });
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
