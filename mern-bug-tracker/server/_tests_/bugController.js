import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import Bug from '../models/Bug.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Bug.deleteMany({});
});

describe('Bug Controller', () => {
  const sampleBug = {
    title: 'Test Bug',
    description: 'This is a test bug description that is long enough',
    severity: 'high',
    priority: 'medium',
    reportedBy: 'Test User'
  };

  describe('POST /api/bugs', () => {
    it('should create a new bug', async () => {
      const response = await request(app)
        .post('/api/bugs')
        .send(sampleBug)
        .expect(201);

      expect(response.body.title).toBe(sampleBug.title);
      expect(response.body.description).toBe(sampleBug.description);
      expect(response.body.status).toBe('open');
    });

    it('should return validation error for invalid data', async () => {
      const invalidBug = {
        title: 'AB', // Too short
        description: 'Short', // Too short
        reportedBy: 'A' // Too short
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(invalidBug)
        .expect(400);

      expect(response.body.message).toContain('Validation failed');
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/bugs')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/bugs', () => {
    beforeEach(async () => {
      await Bug.create([
        { ...sampleBug, title: 'Bug 1', severity: 'high' },
        { ...sampleBug, title: 'Bug 2', severity: 'low' },
        { ...sampleBug, title: 'Bug 3', status: 'resolved' }
      ]);
    });

    it('should get all bugs', async () => {
      const response = await request(app)
        .get('/api/bugs')
        .expect(200);

      expect(response.body.bugs).toHaveLength(3);
      expect(response.body.total).toBe(3);
    });

    it('should filter bugs by status', async () => {
      const response = await request(app)
        .get('/api/bugs?status=resolved')
        .expect(200);

      expect(response.body.bugs).toHaveLength(1);
      expect(response.body.bugs[0].status).toBe('resolved');
    });

    it('should filter bugs by severity', async () => {
      const response = await request(app)
        .get('/api/bugs?severity=high')
        .expect(200);

      expect(response.body.bugs).toHaveLength(1);
      expect(response.body.bugs[0].severity).toBe('high');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/bugs?page=1&limit=2')
        .expect(200);

      expect(response.body.bugs).toHaveLength(2);
      expect(response.body.currentPage).toBe('1');
      expect(response.body.totalPages).toBe(2);
    });
  });

  describe('GET /api/bugs/:id', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create(sampleBug);
      bugId = bug._id;
    });

    it('should get a bug by ID', async () => {
      const response = await request(app)
        .get(`/api/bugs/${bugId}`)
        .expect(200);

      expect(response.body.title).toBe(sampleBug.title);
    });

    it('should return 404 for non-existent bug', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/bugs/${fakeId}`)
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/api/bugs/invalid-id')
        .expect(400);
    });
  });

  describe('PUT /api/bugs/:id', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create(sampleBug);
      bugId = bug._id;
    });

    it('should update a bug', async () => {
      const updateData = { status: 'in-progress', assignedTo: 'Developer' };

      const response = await request(app)
        .put(`/api/bugs/${bugId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('in-progress');
      expect(response.body.assignedTo).toBe('Developer');
    });

    it('should return 404 for non-existent bug', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/api/bugs/${fakeId}`)
        .send({ status: 'resolved' })
        .expect(404);
    });
  });

  describe('DELETE /api/bugs/:id', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create(sampleBug);
      bugId = bug._id;
    });

    it('should delete a bug', async () => {
      await request(app)
        .delete(`/api/bugs/${bugId}`)
        .expect(200);

      const bug = await Bug.findById(bugId);
      expect(bug).toBeNull();
    });

    it('should return 404 for non-existent bug', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/bugs/${fakeId}`)
        .expect(404);
    });
  });

  describe('GET /api/bugs/stats', () => {
    beforeEach(async () => {
      await Bug.create([
        { ...sampleBug, status: 'open', severity: 'high' },
        { ...sampleBug, status: 'in-progress', severity: 'medium' },
        { ...sampleBug, status: 'resolved', severity: 'low' },
        { ...sampleBug, status: 'closed', severity: 'critical' }
      ]);
    });

    it('should return bug statistics', async () => {
      const response = await request(app)
        .get('/api/bugs/stats')
        .expect(200);

      expect(response.body.total).toBe(4);
      expect(response.body.open).toBe(1);
      expect(response.body.inProgress).toBe(1);
      expect(response.body.resolved).toBe(1);
      expect(response.body.closed).toBe(1);
    });
  });
});