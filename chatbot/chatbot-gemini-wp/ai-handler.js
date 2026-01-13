const Groq = require("groq-sdk");
const { MessageMedia } = require("whatsapp-web.js");
const mongoService = require("./mongo-service.js");
require('dotenv').config({ path: '../../.env' });
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const activeChats = new Map();
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

const SYSTEM_PROMPT = `You are the "SPI Exam Manager Assistant" 🤖. 
- Tone: Polite, brief, and professional. 
- PRIMARY DIRECTIVE: You ONLY answer questions related to the SPI Exam Management System (exams, rooms, students, teachers, stats).
- STRICT RULE: If the user asks about anything else (e.g., weather, sports, jokes, general knowledge, movies, politics), politely REFUSE. Say: "I can only assist with Exam Management System queries."`
- Rule: If the user says "Hi", "Hello", or "How are you", respond warmly but briefly.
- Rule: If data is requested (stats, rooms, students), use tools implicitly.
- Rule: Never mention tool/function names in chat.`;

async function handleMessage(message, chat) {
  await chat.sendStateTyping();

  try {
    const chatId = message.from;
    const lowerBody = message.body.toLowerCase();

    // --- DYNAMIC GREETING LOGIC ---
    const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "hlo"];
    if (greetings.some(g => lowerBody.includes(g)) && lowerBody.length < 20) {
      const hour = new Date().getHours();
      let timeGreeting = "Good Morning";
      if (hour >= 12 && hour < 17) timeGreeting = "Good Afternoon";
      else if (hour >= 17) timeGreeting = "Good Evening";

      const welcomeMsg = `${timeGreeting}! ☀️
I am your *SPI Exam Assistant* 🤖.

I can help you with:
🏫 *Room Details* (e.g., "Room 403 data")
📊 *System Stats* (e.g., "Show stats")
🔍 *Student Search* (e.g., "Find Aryan")
📝 *Exam Schedules*

How can I assist you right now?`;

      await message.reply(welcomeMsg);
      return; // Stop here, don't call AI
    }
    // -----------------------------

    let history = activeChats.get(chatId)?.history || [];

    history.push({ role: "user", content: message.body });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history
      ],
      model: "llama-3.3-70b-versatile",
    });

    const aiResponse = completion.choices[0].message.content;

    let finalResponse = aiResponse;
    const lowerResponse = aiResponse.toLowerCase();
    let toolExecuted = false;

    // Check if it's JUST a greeting (to avoid appending stats to a "Hi")
    const isGreetingOnly = (lowerBody === "hi" || lowerBody === "hello" || lowerBody === "hey");

    // 1. Dashboard Stats (Only if NOT just a greeting)
    if (!toolExecuted && !isGreetingOnly && (lowerResponse.includes("get_dashboard_stats") || (lowerResponse.includes("stats") && lowerResponse.includes("system")))) {
      toolExecuted = true;
      const stats = await mongoService.getDashboardStats();
      finalResponse += `\n\n📊 *SPI SYSTEM STATS*
━━━━━━━━━━━━━━━━━━━━
👥 Students: *${stats.students}*
👨‍🏫 Teachers: *${stats.teachers}*
🏢 Rooms: *${stats.rooms}*
📝 Exams: *${stats.exams}*
━━━━━━━━━━━━━━━━━━━━`;
    }

    // 2. Room Details
    const roomMatch = aiResponse.match(/get_room_details\W+(\w+)\W+/i) || lowerResponse.match(/room\s*[:#-]?\s*(\d+)/);

    if (!toolExecuted && !isGreetingOnly && roomMatch) {
      toolExecuted = true;
      const roomNum = roomMatch[1];
      const details = await mongoService.getRoomDetails(roomNum);

      if (details.error) {
        finalResponse = `❌ *Error:* ${details.error}`;
      } else if (details.status) {
        finalResponse = `🏫 *Room ${roomNum}:* ${details.status}`;
      } else {
        const subject = (details.exam && details.exam.subjectName) ? details.exam.subjectName : "Not Scheduled";
        const invName = (typeof details.invigilator === 'object' && details.invigilator.name) ? details.invigilator.name : (details.invigilator || "Not Assigned");

        const firstE = (details.students && details.students.length > 0) ? details.students[0].enrollNo : "N/A";
        const lastE = (details.students && details.students.length > 0) ? details.students[details.students.length - 1].enrollNo : "N/A";

        finalResponse = aiResponse + `\n\n🏫 *ROOM ${roomNum} REPORT*
━━━━━━━━━━━━━━━━━━━━
📑 *EXAM:* *${subject}*
👮 *INVIGILATOR:* *${invName}*

👥 *TOTAL STUDENTS:* *${details.studentCount}*
📍 *RANGE:* *${firstE}* ➔ *${lastE}*
━━━━━━━━━━━━━━━━━━━━`;
      }
    }

    await message.reply(finalResponse);

    history.push({ role: "assistant", content: finalResponse });
    activeChats.set(chatId, { history: history.slice(-10), lastActivity: Date.now() });

  } catch (error) {
    console.error("❌ Error in Groq handleMessage:", error);
    await message.reply("Sorry, I encountered an error. Please try again.");
  } finally {
    await chat.clearState();
  }
}

module.exports = { handleMessage };
