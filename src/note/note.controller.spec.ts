import { Test, TestingModule } from '@nestjs/testing';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';

describe('NoteController', () => {
  let controller: NoteController;

  const mockReq = {
    user: {
      userId: 'user-1',
      id: 'user-1',
    },
  };

  const mockNoteService = {
    create: jest.fn().mockImplementation((dto) => ({ id: '1', ...dto })),
    findAll: jest
      .fn()
      .mockResolvedValue([{ id: '1', title: 'Test', content: 'Content' }]),
    findOne: jest
      .fn()
      .mockImplementation((id) => ({ id, title: 'Test', content: 'Content' })),
    update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
    remove: jest.fn().mockImplementation((id) => ({ id })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteController],
      providers: [NoteService],
    })
      .overrideProvider(NoteService)
      .useValue(mockNoteService)
      .compile();

    controller = module.get<NoteController>(NoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should create a note', async () => {
    const dto = { title: 'New Note', content: 'Note content' };
    expect(await controller.create(mockReq, dto)).toEqual({ id: '1', ...dto });
    expect(mockNoteService.create).toHaveBeenCalledWith(dto);
  });

  it('should get all notes', async () => {
    expect(await controller.findAll()).toEqual([
      { id: '1', title: 'Test', content: 'Content' },
    ]);
    expect(mockNoteService.findAll).toHaveBeenCalled();
  });

  it('should get one note', async () => {
    expect(await controller.findOne('1')).toEqual({
      id: '1',
      title: 'Test',
      content: 'Content',
    });
    expect(mockNoteService.findOne).toHaveBeenCalledWith('1');
  });

  it('should update a note', async () => {
    const dto = { title: 'Updated Note' };
    expect(await controller.update(mockReq, '1', dto)).toEqual({
      id: '1',
      ...dto,
    });
    expect(mockNoteService.update).toHaveBeenCalledWith('1', dto);
  });

  it('should delete a note', async () => {
    expect(await controller.remove(mockReq, '1')).toEqual({ id: '1' });
    expect(mockNoteService.remove).toHaveBeenCalledWith('1');
  });
});
