import { getDB } from '../services/database.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('--- Starting Database Seed Script ---');
  const db = await getDB();

  console.log(`Successfully connected to database: ${db.databaseName}`);

  // List of all collections to be cleared
  const collections = ['admins', 'teachers', 'students', 'rooms', 'exams', 'invigilations', 'seating', 'reports'];

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log(`Clearing ${count} documents from '${collectionName}' collection...`);
      await collection.deleteMany({});
    } else {
      console.log(`Collection '${collectionName}' is already empty.`);
    }
  }

  console.log('\n--- All collections cleared ---\n');
  console.log('--- Creating new sample users ---');

  const saltRounds = 10;

  // Create one SuperAdmin
  const adminsCollection = db.collection('admins');
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const adminUser = {
    id: uuidv4(),
    name: 'Main Admin',
    email: 'admin@viva.edu',
    password: adminPassword,
    role: 'SuperAdmin',
    createdAt: new Date(),
  };
  await adminsCollection.insertOne(adminUser);
  console.log(`✅ Created Admin:`);
  console.log(`   Email: admin@viva.edu`);
  console.log(`   Password: admin123`);

  // Create one Teacher
  const teachersCollection = db.collection('teachers');
  const teacherPassword = await bcrypt.hash('teacher123', saltRounds);
  const teacherUser = {
    id: 'T001',
    name: 'Sample Teacher',
    email: 'teacher@viva.edu',
    password: teacherPassword,
    department: 'CO',
    phone: '9876543210',
    createdAt: new Date(),
  };
  await teachersCollection.insertOne(teacherUser);
  console.log(`✅ Created Teacher:`);
  console.log(`   Email: teacher@viva.edu`);
  console.log(`   Password: teacher123`);

  console.log('\n--- Seed script finished successfully! ---');

  process.exit(0);
}

main().catch(err => {
  console.error("An error occurred during the seed process:", err);
  process.exit(1);
});
