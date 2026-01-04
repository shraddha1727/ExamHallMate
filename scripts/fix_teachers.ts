import { getDB } from '../services/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

async function main() {
  console.log('--- Starting Teacher Data Fix Script ---');
  const db = await getDB();

  console.log(`Successfully connected to database: ${db.databaseName}`);

  const teachersCollection = db.collection('teachers');
  const allTeachers = await teachersCollection.find({}).toArray();

  let fixedCount = 0;

  for (const teacher of allTeachers) {
    let needsUpdate = false;
    const update: any = {};

    if (!teacher.id) {
      update.id = uuidv4();
      needsUpdate = true;
      console.log(`Fixing teacher ${teacher._id}: Missing id. Adding id ${update.id}`);
    }
    if (!teacher.name) {
        update.name = 'Unknown Name';
        needsUpdate = true;
        console.log(`Fixing teacher ${teacher._id}: Missing name. Adding default name.`);
      }
    if (!teacher.email) {
      update.email = `unknown-${uuidv4()}@example.com`;
      needsUpdate = true;
      console.log(`Fixing teacher ${teacher._id}: Missing email. Adding default email ${update.email}`);
    }
    if (!teacher.password) {
      update.password = await bcrypt.hash('password123', 10);
      needsUpdate = true;
      console.log(`Fixing teacher ${teacher._id}: Missing password. Adding default password.`);
    }
    if (!teacher.createdAt) {
      update.createdAt = new Date();
      needsUpdate = true;
      console.log(`Fixing teacher ${teacher._id}: Missing createdAt. Adding current date.`);
    }

    if (needsUpdate) {
      await teachersCollection.updateOne({ _id: teacher._id }, { $set: update });
      fixedCount++;
    }
  }

  if (fixedCount > 0) {
    console.log(`
--- Fixed ${fixedCount} teacher documents. ---`);
  } else {
    console.log('\n--- No malformed teacher documents found. ---');
  }

  console.log('--- Teacher Data Fix Script finished successfully! ---');
  process.exit(0);
}

main().catch(err => {
  console.error("An error occurred during the fix process:", err);
  process.exit(1);
});
