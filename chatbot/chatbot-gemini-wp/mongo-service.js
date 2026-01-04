const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../../.env' }); // Try to load from root if running from subfolder

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db = null;

async function getDB() {
    if (db) return db;
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

async function getDashboardStats() {
    const database = await getDB();
    const students = await database.collection('students').countDocuments();
    const teachers = await database.collection('teachers').countDocuments();
    const rooms = await database.collection('rooms').countDocuments();
    const exams = await database.collection('exams').countDocuments();
    return { students, teachers, rooms, exams };
}

async function searchStudents(query) {
    const database = await getDB();
    return await database.collection('students').find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { enrollNo: { $regex: query, $options: 'i' } }
        ]
    }).limit(5).toArray();
}

async function listExams() {
    const database = await getDB();
    return await database.collection('exams').find({}).sort({ date: 1 }).toArray();
}

async function getTeachers(department) {
    const database = await getDB();
    const filter = {};
    if (department) filter.department = { $regex: department, $options: 'i' };
    return await database.collection('teachers').find(filter).project({ password: 0 }).toArray();
}

async function getRooms() {
    const database = await getDB();
    return await database.collection('rooms').find({}).toArray();
}

async function getRoomDetails(roomNumber) {
    const database = await getDB();
    
    // Initialize variables in main scope
    let exam = null;
    let invigilator = "Not assigned";
    let roomAssignments = [];
    let currentExamId = null;
    
    // 1. Get Room Info
    const room = await database.collection('rooms').findOne({ roomNumber: roomNumber });
    
    if (!room) {
        return { 
            error: `Room ${roomNumber} database mein exist nahi karta. Please valid room number check karein.` 
        };
    }
    
    // 2. Search ALL seating plans for assignments in this room
    const allSeatingPlans = await database.collection('seating').find({}).toArray();

    // Loop through ALL plans and collect students for this room
    for (const plan of allSeatingPlans) {
        if (plan.assignments && Array.isArray(plan.assignments)) {
            const matches = plan.assignments.filter(a => a.roomNumber == roomNumber); 
            if (matches.length > 0) {
                roomAssignments = roomAssignments.concat(matches);
                if (!currentExamId) currentExamId = matches[0].examId;
            }
        }
    }

    // 4. Get Invigilator Details
    if (room) {
        const invigilation = await database.collection('invigilations').findOne({ 
            roomId: room.id 
        });
        
        if (invigilation) {
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

    if (roomAssignments.length === 0) {
        if (invigilator !== "Not assigned") {
            return {
                room: room,
                status: `Room ${roomNumber} mein Invigilator (${invigilator.name}) assigned hain, lekin Seating Plan abhi tak upload nahi hua hai.`
            };
        } else {
            return { 
                room: room, 
                status: `Room ${roomNumber} khali hai. Aaj yahan koi exam schedule nahi dikh raha.` 
            };
        }
    }

    // 3. Get Exam Details (If students found)
    if (currentExamId) {
        exam = await database.collection('exams').findOne({ id: currentExamId });
    }

    // Sort assignments
    roomAssignments.sort((a, b) => {
        const idA = parseInt(a.studentId) || 0;
        const idB = parseInt(b.studentId) || 0;
        return idA - idB;
    });

    return {
        room: room,
        exam: exam || { subjectName: "Unknown", subjectCode: "N/A" },
        invigilator: invigilator,
        studentCount: roomAssignments.length,
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
