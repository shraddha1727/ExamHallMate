/**
 * =============================================================
 * FILE: mongo-service.js
 * PURPOSE: Database Operations (CRUD) for the Chatbot
 * =============================================================
 * ARCHITECTURE NOTE:
 * This file uses the native 'mongodb' driver to connect to MongoDB Atlas.
 * It provides helper functions that the AI (in ai-handler.js) calls when 
 * it needs accurate, real-time data instead of hallucinating.
 * Functions here count stats, check room availability, and map
 * seating arrangements dynamically from different collections.
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../../.env' }); // Extract MONGODB_URI from root project env

const uri = process.env.MONGODB_URI;
// Initialize Mongo client instance
const client = new MongoClient(uri);

let db = null; // Caches the DB instance so we don't reconnect on every message

/**
 * Connects to MongoDB Atlas if not already connected
 * @returns {Db} The database instance
 */
async function getDB() {
    if (db) return db; // Return cached DB to save network time
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
        db = client.db('spi');
        return db;
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        throw err;
    }
}

/**
 * Computes live dashboard metrics by counting documents in multiple collections
 * Called when users ask "Show system stats"
 */
async function getDashboardStats() {
    const database = await getDB();
    const students = await database.collection('students').countDocuments();
    const teachers = await database.collection('teachers').countDocuments();
    const rooms = await database.collection('rooms').countDocuments();
    const exams = await database.collection('exams').countDocuments();
    return { students, teachers, rooms, exams };
}

/**
 * Searches for a student by partial name or enrollment number
 */
async function searchStudents(query) {
    const database = await getDB();
    return await database.collection('students').find({
        $or: [
            { name: { $regex: query, $options: 'i' } }, // Case-insensitive Regex match
            { enrollNo: { $regex: query, $options: 'i' } }
        ]
    }).limit(5).toArray(); // Limit to 5 results to avoid flooding WhatsApp message
}

/**
 * Lists out upcoming exams
 */
async function listExams() {
    const database = await getDB();
    return await database.collection('exams').find({}).sort({ date: 1 }).toArray();
}

/**
 * Filters and retrieves teachers by department
 */
async function getTeachers(department) {
    const database = await getDB();
    const filter = {};
    if (department) filter.department = { $regex: department, $options: 'i' };

    // .project({ password: 0 }) ensures passwords are NEVER fetched or leaked to AI
    return await database.collection('teachers').find(filter).project({ password: 0 }).toArray();
}

/**
 * Gets a clean list of all physical rooms
 */
async function getRooms() {
    const database = await getDB();
    return await database.collection('rooms').find({}).toArray();
}

/**
 * COMPLEX QUERY: Gets the current Exam schedule & Seating details for a specific room.
 * NOTE: This function pulls data from 5 different collections:
 * (Rooms, Seating, Invigilations, Teachers, Exams) and merges them into one JSON payload!
 * 
 * @param {string} roomNumber - E.g., "403"
 */
async function getRoomDetails(roomNumber) {
    const database = await getDB();

    let exam = null;
    let invigilator = "Not assigned";
    let roomAssignments = [];
    let currentExamId = null;

    // 1. Check if the physical room exists in `rooms` collection
    const room = await database.collection('rooms').findOne({ roomNumber: roomNumber });

    if (!room) {
        return {
            error: `Room ${roomNumber} does not exist in the database. Please check the room number.`
        };
    }

    // 2. Loop through ALL active seating plans to find which students are assigned to this room
    const allSeatingPlans = await database.collection('seating').find({}).toArray();

    for (const plan of allSeatingPlans) {
        if (plan.assignments && Array.isArray(plan.assignments)) {
            // Filter out only the assignments matching this specific room
            const matches = plan.assignments.filter(a => a.roomNumber == roomNumber);
            if (matches.length > 0) {
                roomAssignments = roomAssignments.concat(matches);
                if (!currentExamId) currentExamId = matches[0].examId; // Lock onto the exam happening here
            }
        }
    }

    // 3. Find who the Assigned Invigilator (Teacher) is for this exam
    if (room) {
        const invigilation = await database.collection('invigilations').findOne({ roomId: room.id });

        if (invigilation) {
            // Get teacher's name using their ID
            const teacher = await database.collection('teachers').findOne({ id: invigilation.teacherId });
            if (teacher) {
                invigilator = {
                    name: teacher.name,
                    phone: teacher.phone || "No phone added",
                    dept: teacher.department
                };
            }
        }
    }

    // Handle Edge Cases: Empty Room
    if (roomAssignments.length === 0) {
        if (invigilator !== "Not assigned") {
            return {
                room: room,
                status: `Room ${roomNumber} has Invigilator (${invigilator.name}) assigned, but Seating Plan is not uploaded yet.`
            };
        } else {
            return {
                room: room,
                status: `Room ${roomNumber} is empty. No exams are scheduled here today.`
            };
        }
    }

    // 4. Get the Subject/Exam name using the locked examId
    if (currentExamId) {
        exam = await database.collection('exams').findOne({ id: currentExamId });
    }

    // 5. Build and return the final data structure
    return {
        room: room,
        exam: exam || { subjectName: "Unknown", subjectCode: "N/A" },
        invigilator: invigilator,
        studentCount: roomAssignments.length, // Total headcount calculated
        students: roomAssignments.map(s => ({
            name: s.studentName,
            enrollNo: s.studentId,
            seat: s.seatNumber,
            branch: s.branch
        }))
    };
}

module.exports = {
    getDashboardStats,
    searchStudents,
    listExams,
    getTeachers,
    getRooms,
    getRoomDetails
};
