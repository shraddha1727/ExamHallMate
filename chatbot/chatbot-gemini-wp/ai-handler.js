/**
 * =============================================================
 * FILE: ai-handler.js
 * PURPOSE: Core Chatbot Logic & AI Integration
 * =============================================================
 * ARCHITECTURE NOTE:
 * This file handles the "Brain" of the chatbot. 
 * We use the 'Groq SDK' to connect to the fast LLaMA-3.3 model.
 * It takes the user's message, merges it with the chat history, 
 * and sends it to the AI. If the AI signifies that it needs data 
 * (like get_room_details or stats), we intercept the response, 
 * query our live MongoDB via 'mongo-service.js', and append 
 * that live data to the message before sending it to the user.
 */

// 1. Import necessary libraries
const Groq = require("groq-sdk"); // Groq library for AI models
const { MessageMedia } = require("whatsapp-web.js"); // To handle image/media messages
const mongoService = require("./mongo-service.js"); // Database operations
require('dotenv').config({ path: '../../.env' }); // Load root env variables
require('dotenv').config(); // Load local env variables

// 2. Initialize AI Client with our API Key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 3. User Session Management (To let the AI remember context)
const activeChats = new Map(); // Maps phone numbers to their chat history
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins timeout

// 4. System Prompt: This is the "Persona" given to the AI behind the scenes.
const SYSTEM_PROMPT = `You are "ExamHallMate AI" 🤖. 
- Tone: Polite, brief, and professional. 
- PRIMARY DIRECTIVE: You ONLY answer questions related to ExamHallMate (exams, rooms, students, teachers, stats).
- STRICT RULE: If the user asks about anything else (e.g., weather, sports, jokes, general knowledge, movies, politics), politely REFUSE. Say: "I can only assist with ExamHallMate queries."
- Rule: If the user says "Hi", "Hello", or "How are you", respond warmly but briefly.
- Rule: If data is requested (stats, rooms, students), use tools implicitly.
- Rule: Never mention tool/function names in chat.
- Rule: NEVER use markdown format strictly NO asterisks (*) or underscores (_). Use clean plain text.`;

/**
 * Main Function that processes every incoming text message.
 */
async function handleMessage(message, chat) {
  // Show "typing..." indicator in WhatsApp to look realistic
  await chat.sendStateTyping();

  try {
    const chatId = message.from; // User's phone number ID
    const lowerBody = message.body.toLowerCase(); // Convert to lowercase for checking

    // --- DYNAMIC GREETING LOGIC ---
    // If it's a simple greeting ("hi", "hello"), we DO NOT call the AI (Saves API tokens).
    // Instead, we reply instantly with a helpful hardcoded menu.
    const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "hlo"];
    if (greetings.some(g => lowerBody.includes(g)) && lowerBody.length < 20) {
      const hour = new Date().getHours();
      let timeGreeting = "Good Morning";
      if (hour >= 12 && hour < 17) timeGreeting = "Good Afternoon";
      else if (hour >= 17) timeGreeting = "Good Evening";

      // Menu string layout
      const welcomeMsg = `${timeGreeting}! ☀️
I am ExamHallMate AI 🤖.

I can help you with:
🏫 Room Details (e.g., "Room 403 data")
📊 System Stats (e.g., "Show stats")
🔍 Student Search (e.g., "Find Aryan")
📝 Exam Schedules

How can I assist you right now?`;

      await message.reply(welcomeMsg);
      return; // Stop execution here
    }
    // -----------------------------

    // Get previous chat history for this user (if any exists)
    let history = activeChats.get(chatId)?.history || [];

    // Add the current message to history
    history.push({ role: "user", content: message.body });

    // Ask Groq AI for an intelligent contextual response based on history
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT }, // Send persona
        ...history // Send past conversation context
      ],
      model: "llama-3.3-70b-versatile", // Advanced language model
    });

    const aiResponse = completion.choices[0].message.content; // Extract raw text

    let finalResponse = aiResponse;
    const lowerResponse = aiResponse.toLowerCase();
    let toolExecuted = false; // Flag to prevent multiple DB queries in one turn

    const isGreetingOnly = (lowerBody === "hi" || lowerBody === "hello" || lowerBody === "hey");

    // --- TOOL INTERCEPTION LOGIC (VIVA: How Data Gets Fetched) ---
    // The AI doesn't know the live data, but it generates flags like "get_dashboard_stats".
    // We catch those flags below, query the MongoDB, and attach the data text manually!

    // 1. Dashboard Stats
    if (!toolExecuted && !isGreetingOnly && (lowerResponse.includes("get_dashboard_stats") || (lowerResponse.includes("stats") && lowerResponse.includes("system")))) {
      toolExecuted = true;
      const stats = await mongoService.getDashboardStats(); // Query live database

      // Append the live data dynamically
      finalResponse += `\n\n📊 ExamHallMate: System Stats
━━━━━━━━━━━━━━━━━━━━
👥 Students: ${stats.students}
👨‍🏫 Teachers: ${stats.teachers}
🏢 Rooms: ${stats.rooms}
📝 Exams: ${stats.exams}
━━━━━━━━━━━━━━━━━━━━`;
    }

    // 2. Room Details Logic
    // Catch if AI outputs "get_room_details 403" using regular expressions (Regex)
    const roomMatch = aiResponse.match(/get_room_details\W+(\w+)\W+/i) || lowerResponse.match(/room\s*[:#-]?\s*(\d+)/);

    if (!toolExecuted && !isGreetingOnly && roomMatch) {
      toolExecuted = true;
      const roomNum = roomMatch[1]; // Get room number (e.g., 403)
      const details = await mongoService.getRoomDetails(roomNum); // Query Database

      if (details.error) {
        finalResponse = `❌ Error: ${details.error}`;
      } else if (details.status) {
        finalResponse = `🏫 Room ${roomNum}: ${details.status}`; // E.g., "Not Assigned"
      } else {
        // Safe check for nested objects
        const subject = (details.exam && details.exam.subjectName) ? details.exam.subjectName : "Not Scheduled";
        const invName = (typeof details.invigilator === 'object' && details.invigilator.name) ? details.invigilator.name : (details.invigilator || "Not Assigned");

        // Format final response for WhatsApp
        finalResponse = aiResponse + `\n\n🏫 ROOM ${roomNum} REPORT (ExamHallMate)
━━━━━━━━━━━━━━━━━━━━
📑 EXAM: ${subject}
👮 INVIGILATOR: ${invName}

👥 TOTAL STUDENTS: ${details.studentCount}
━━━━━━━━━━━━━━━━━━━━`;
      }
    }

    // Send the final processed text back to the WhatsApp user
    await message.reply(finalResponse);

    // Save AI's response in history array (only keeping the last 10 messages to save memory)
    history.push({ role: "assistant", content: finalResponse });
    activeChats.set(chatId, { history: history.slice(-10), lastActivity: Date.now() });

  } catch (error) {
    // If AI fails or database crashes, silently handle it and notify user
    console.error("❌ Error in Groq handleMessage:", error);
    await message.reply("Sorry, I encountered an error. Please try again.");
  } finally {
    // Clear typing indicator so it doesn't get stuck
    await chat.clearState();
  }
}

// Export the function so whatsapp-manager.js can call it
module.exports = { handleMessage };
