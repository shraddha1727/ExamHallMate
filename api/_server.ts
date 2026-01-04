console.log('--- SERVER.TS IS RUNNING ---');
console.log('--- THIS IS THE LATEST VERSION ---');
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MongoClient, Db } from 'mongodb';

// --- INLINED DATABASE LOGIC START ---
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'spi';
let cachedDb: Db | null = null;

async function getDB(): Promise<Db> {
  if (cachedDb) return cachedDb;
  if (!uri) throw new Error('MONGODB_URI is missing');

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();
  cachedDb = client.db(dbName);
  return cachedDb;
}
// --- INLINED DATABASE LOGIC END ---
import { v4 as uuidv4 } from 'uuid';

import bcrypt from 'bcrypt';

/* =======================
   Extend Express Request
======================= */
declare global {
  namespace Express {
    interface Request {
      db: Db;
    }
  }
}

/* =======================
   App Setup
======================= */
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

/* =======================
   DB Middleware
======================= */
const dbMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!globalDb) {
    try {
      globalDb = await getDB();
    } catch (err) {
      console.error('Database connection failed in middleware:', err);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  req.db = globalDb;
  next();
};

app.use(dbMiddleware);

/* =======================
   AUTH LOGIN
======================= */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email & password required' });
  }

  try {
    let user = await req.db.collection('admins').findOne({ email });
    let role = 'SuperAdmin';

    if (!user) {
      user = await req.db.collection('teachers').findOne({ email });
      role = 'Teacher';
    }

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Login failed');
  }
});

/* =======================
   USER REGISTER
======================= */
app.post('/api/users/register', async (req: Request, res: Response) => {
  const { role, email, password, name, department } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    if (role === 'Admin') {
      await req.db.collection('admins').insertOne({
        id: uuidv4(),
        name,
        email,
        password: hashed,
        role: 'SuperAdmin',
        createdAt: new Date()
      });
    } else if (role === 'Staff') {
      await req.db.collection('teachers').insertOne({
        id: uuidv4(),
        name,
        email,
        department,
        password: hashed,
        createdAt: new Date()
      });
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/* =======================
   TEACHERS API
======================= */
app.get('/api/teachers', async (req: Request, res: Response) => {
  try {
    const teachers = await req.db.collection('teachers').find({}).toArray();
    res.json(teachers);
  } catch (err) {
    console.error('Failed to get teachers:', err);
    res.status(500).json({ error: 'Failed to retrieve teachers', details: err });
  }
});

app.post('/api/teachers', async (req: Request, res: Response) => {
  const { id, name, email, password, department } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name & email required' });
  }

  try {
    if (id) {
      const update: any = { name, email, department };
      if (password) {
        update.password = await bcrypt.hash(password, 10);
      }

      const result = await req.db
        .collection('teachers')
        .updateOne({ id }, { $set: update });

      if (!result.matchedCount) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.json({ message: 'Teacher updated' });
    } else {
      await req.db.collection('teachers').insertOne({
        id: uuidv4(),
        name,
        email,
        department,
        password: await bcrypt.hash(password, 10),
        createdAt: new Date()
      });
      res.status(201).json({ message: 'Teacher created' });
    }
  } catch (err) {
    console.error('Teacher save error:', err);
    res.status(500).json({ error: 'Teacher save failed' });
  }
});

app.delete('/api/teachers/:id', async (req: Request, res: Response) => {
  try {
    const result = await req.db
      .collection('teachers')
      .deleteOne({ id: req.params.id });

    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    console.error('Failed to delete teacher:', err);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

/* =======================
   ROOMS API
======================= */

app.get('/api/rooms', async (req: Request, res: Response) => {
  console.log('GET /api/rooms called');
  try {
    const rooms = await req.db.collection('rooms').find({}).toArray();
    res.json(rooms);
  } catch (err) {
    console.error('Failed to get rooms:', err);
    res.status(500).json({ error: 'Failed to retrieve rooms' });
  }
});

app.post('/api/rooms', async (req: Request, res: Response) => {
  console.log('POST /api/rooms called');
  const { id, roomNumber, capacity, isActive } = req.body;

  if (!roomNumber || !capacity) {
    return res.status(400).json({ error: 'Room number and capacity are required' });
  }

  try {
    if (id) {
      const result = await req.db.collection('rooms').updateOne(
        { id },
        { $set: { roomNumber, capacity, isActive } }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.json({ message: 'Room updated' });
    } else {
      await req.db.collection('rooms').insertOne({
        id: uuidv4(),
        roomNumber,
        capacity,
        isActive,
        createdAt: new Date()
      });
      res.status(201).json({ message: 'Room created' });
    }
  } catch (err) {
    console.error('Room save error:', err);
    res.status(500).json({ error: 'Room save failed' });
  }
});

app.delete('/api/rooms/:id', async (req: Request, res: Response) => {
  console.log('DELETE /api/rooms/:id called');
  try {
    const result = await req.db
      .collection('rooms')
      .deleteOne({ id: req.params.id });

    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ message: 'Room deleted' });
  } catch (err) {
    console.error('Failed to delete room:', err);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

/* =======================
   STUDENTS API
======================= */

app.get('/api/students/all', async (req: Request, res: Response) => {
  console.log('GET /api/students/all called');
  try {
    const students = await req.db.collection('students').find({}).toArray();
    res.json(students);
  } catch (err) {
    console.error('Failed to get all students:', err);
    res.status(500).json({ error: 'Failed to retrieve all students' });
  }
});

app.get('/api/students', async (req: Request, res: Response) => {
  const { branch, semester, page = 1, limit = 10, searchTerm } = req.query;

  if (!branch || !semester) {
    return res.status(400).json({ error: 'Branch and semester are required' });
  }

  try {
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {
      branch,
      semester: semester.toString(),
    };

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { enrollNo: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const students = await req.db.collection('students')
      .find(query)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const totalRecords = await req.db.collection('students').countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limitNum);

    res.json({
      students,
      totalPages,
      totalRecords,
      currentPage: pageNum,
    });
  } catch (err) {
    console.error('Failed to get students:', err);
    res.status(500).json({ error: 'Failed to retrieve students' });
  }
});
app.get('/api/students/stats', async (req: Request, res: Response) => {
  try {
    const stats = await req.db.collection('students').aggregate([
      // Stage 1: Group by branch and semester to count students
      {
        $group: {
          _id: {
            branch: '$branch',
            semester: '$semester'
          },
          studentCount: { $sum: 1 }
        }
      },
      // Stage 2: Sort by semester
      {
        $sort: {
          '_id.semester': 1
        }
      },
      // Stage 3: Group by branch to create the semesters array
      {
        $group: {
          _id: '$_id.branch',
          semesters: {
            $push: {
              semester: '$_id.semester',
              count: '$studentCount'
            }
          },
          count: { $sum: '$studentCount' }
        }
      },
      // Stage 4: Project to the final format
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: '$count',
          semesters: '$semesters'
        }
      },
      // Stage 5: Sort by branch name
      {
        $sort: {
          name: 1
        }
      }
    ]).toArray();

    res.json(stats);
  } catch (err) {
    console.error('Failed to get student stats:', err);
    res.status(500).json({ error: 'Failed to retrieve student statistics' });
  }
});

app.post('/api/students/bulk', async (req: Request, res: Response) => {
  console.log('POST /api/students/bulk called');
  const { students } = req.body;

  if (!Array.isArray(students)) {
    return res.status(400).json({ error: 'Request body must contain an array of students' });
  }

  try {
    const bulkOperations = students.map((student: any) => ({
      updateOne: {
        filter: { enrollNo: student.enrollNo },
        update: { $set: student },
        upsert: true,
      },
    }));

    const result = await req.db.collection('students').bulkWrite(bulkOperations);
    res.status(200).json({
      message: 'Bulk student upsert successful',
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error('Bulk student upsert error:', err);
    res.status(500).json({ error: 'Failed to bulk upsert students' });
  }
});

app.delete('/api/students', async (req: Request, res: Response) => {
  console.log('DELETE /api/students called');
  try {
    const result = await req.db.collection('students').deleteMany({});
    res.status(200).json({
      message: `Deleted ${result.deletedCount} students`,
    });
  } catch (err) {
    console.error('Bulk student delete error:', err);
    res.status(500).json({ error: 'Failed to delete students' });
  }
});

/* =======================
   SEATING API
======================= */

app.get('/api/seating/:examId', async (req: Request, res: Response) => {
  console.log('GET /api/seating/:examId called');
  try {
    const seating = await req.db.collection('seating').findOne({ examId: req.params.examId });
    if (!seating) {
      return res.status(404).json({ error: 'Seating arrangement not found' });
    }
    res.json(seating);
  } catch (err) {
    console.error('Failed to get seating:', err);
    res.status(500).json({ error: 'Failed to retrieve seating arrangement' });
  }
});

app.post('/api/seating', async (req: Request, res: Response) => {
  console.log('POST /api/seating called');
  const seating = req.body;

  if (!seating || !seating.examId) {
    return res.status(400).json({ error: 'Seating data must contain an examId' });
  }

  try {
    await req.db.collection('seating').updateOne(
      { examId: seating.examId },
      { $set: seating },
      { upsert: true }
    );
    res.status(200).json({ message: 'Seating arrangement saved' });
  } catch (err) {
    console.error('Seating save error:', err);
    res.status(500).json({ error: 'Failed to save seating arrangement' });
  }
});

/* =======================
   INVIGILATION API
======================= */

app.get('/api/invigilations', async (req: Request, res: Response) => {
  try {
    const invigilations = await req.db.collection('invigilations').find({}).toArray();
    res.json(invigilations);
  } catch (err) {
    console.error('Failed to get invigilations:', err);
    res.status(500).json({ error: 'Failed to retrieve invigilations' });
  }
});

app.post('/api/invigilations', async (req: Request, res: Response) => {
  const invigilation = req.body;
  try {
    await req.db.collection('invigilations').insertOne(invigilation);
    res.status(201).json({ message: 'Invigilation assigned' });
  } catch (err) {
    console.error('Invigilation assign error:', err);
    res.status(500).json({ error: 'Failed to assign invigilation' });
  }
});

app.post('/api/invigilations/bulk', async (req: Request, res: Response) => {
  const { assignments } = req.body;
  if (!Array.isArray(assignments)) {
    return res.status(400).json({ error: 'Request body must contain an array of assignments' });
  }
  try {
    // Clear existing assignments before bulk saving new ones.
    // This assumes we want to replace all old assignments with the new bulk ones.
    await req.db.collection('invigilations').deleteMany({});

    if (assignments.length > 0) {
      const bulkOperations = assignments.map((assignment: any) => ({
        insertOne: {
          document: { ...assignment, _id: uuidv4() } // Ensure unique _id for new inserts
        },
      }));
      await req.db.collection('invigilations').bulkWrite(bulkOperations);
    }

    res.status(200).json({ message: 'Bulk invigilation assignments successful' });
  } catch (err) {
    console.error('Bulk invigilation save error:', err);
    res.status(500).json({ error: 'Failed to save invigilation assignments' });
  }
});

app.delete('/api/invigilations', async (req: Request, res: Response) => {
  try {
    const result = await req.db.collection('invigilations').deleteMany({});
    res.status(200).json({
      message: `Deleted ${result.deletedCount} invigilation assignments`,
    });
  } catch (err) {
    console.error('Bulk invigilation delete error:', err);
    res.status(500).json({ error: 'Failed to delete invigilation assignments' });
  }
});

app.get('/api/exams', async (req: Request, res: Response) => {
  try {
    const exams = await req.db.collection('exams').find({}).toArray();
    res.json(exams);
  } catch (err) {
    console.error('Failed to get exams:', err);
    res.status(500).json({ error: 'Failed to retrieve exams' });
  }
});

app.post('/api/exams', async (req: Request, res: Response) => {
  const { id, name, date } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: 'Name and date are required' });
  }

  try {
    if (id) {
      const result = await req.db.collection('exams').updateOne(
        { id },
        { $set: { name, date } }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      res.json({ message: 'Exam updated successfully' });
    } else {
      const newExam = {
        id: uuidv4(),
        name,
        date,
        createdAt: new Date(),
      };

      await req.db.collection('exams').insertOne(newExam);

      res.status(201).json({ message: 'Exam created successfully' });
    }
  } catch (err) {
    console.error('Exam save error:', err);
    res.status(500).json({ error: 'Failed to save exam' });
  }
});

app.delete('/api/exams/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await req.db.collection('exams').deleteOne({ id });

    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    console.error('Exam delete error:', err);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

app.post('/api/exams/bulk', async (req: Request, res: Response) => {
  const { exams } = req.body;

  if (!Array.isArray(exams)) {
    return res.status(400).json({ error: 'Request body must contain an array of exams' });
  }

  try {
    const bulkOperations = exams.map((exam: any) => ({
      updateOne: {
        filter: { id: exam.id },
        update: { $set: exam },
        upsert: true,
      },
    }));

    if (bulkOperations.length > 0) {
      await req.db.collection('exams').bulkWrite(bulkOperations);
    }

    res.status(200).json({ message: 'Bulk exams upsert successful' });
  } catch (err) {
    console.error('Bulk exams upsert error:', err);
    res.status(500).json({ error: 'Failed to bulk upsert exams' });
  }
});

/* =======================
   HEALTH + 404
======================= */
app.get('/api/health', (_req, res) => res.send('OK'));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.url}` });
});

/* =======================
   START SERVER
======================= */

/* =======================
   START SERVER
======================= */
let globalDb: Db;

export default app; // Export for Vercel

// Only start the server if running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      globalDb = await getDB();
      app.listen(port, '0.0.0.0', () => {
        console.log(`✅ Server running on http://0.0.0.0:${port}`);
      });
    } catch (err) {
      console.error('Failed to connect to the database or start server:', err);
      process.exit(1);
    }
  })();
} else {
  // For Vercel: Do nothing here. dbMiddleware handles the connection.
  console.log('✅ App loaded in Serverless mode');
}