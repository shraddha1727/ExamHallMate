/**
 * =============================================================
 * FILE: whatsapp-manager.js
 * PURPOSE: Manages WhatsApp Connection using Puppeteer
 * =============================================================
 * ARCHITECTURE NOTE:
 * This file creates the actual bridge between WhatsApp and our Node.js server.
 * It uses 'whatsapp-web.js' which spins up an invisible (headless) Google
 * Chrome browser using Puppeteer. This browser opens WhatsApp Web internally,
 * generates a QR Code, and lets the user log in. Once logged in, it acts
 * as a listener that catches any incoming text message and forwards it to
 * the AI handler function.
 */

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal"); // For printing the QR code in the terminal UI
const { handleMessage } = require("./ai-handler.js"); // Import our AI logic

class WhatsAppManager {
  constructor() {
    this.client = null; // Holds the WhatsApp Client instance
    this.qrCodeData = null; // Temporarily holds QR string
    this.isReady = false; // Prevents processing messages before full initialization
  }

  // Starts the chromium browser and connects to WhatsApp servers
  initialize() {
    console.log("🚀 Initializing WhatsApp Client with LocalAuth...");

    this.client = new Client({
      // LocalAuth saves the session (cookies) locally in .wwebjs_auth folder so user doesn't 
      // have to scan QR code every single time they restart the server.
      authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
      }),
      // Caching web version to bypass some strict WhatsApp Web versioning blocks
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      },
      // Puppeteer configuration (Chromium browser running in background)
      puppeteer: {
        headless: true, // "true" prevents browser window from physically opening on screen
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox", // Required for docker/Linux environments like Railway
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu", // GPU disabled to save server memory
        ],
        timeout: 60000,
      },
    });

    // Attach listener events (like QR gen, incoming message)
    this.setupEventHandlers();

    console.log("🚀 Starting WhatsApp Client...");
    this.client.initialize(); // Trigger the connection
  }

  // Registers all event lifecycle hooks supplied by whatsapp-web.js
  setupEventHandlers() {
    // 1. Triggered when WhatsApp generates a login QR code
    this.client.on("qr", (qr) => {
      this.qrCodeData = qr;
      console.log("👉 QR Code received! Please scan it with WhatsApp:");
      console.log("If the QR below is distorted, COPY THIS CODE and generate one online (https://www.the-qrcode-generator.com/):");
      console.log(`RAW_QR_CODE: ${qr}`);
      // Generates an ASCII terminal QR code
      qrcode.generate(qr, { small: true });
    });

    // 2. Loading indication
    this.client.on("loading_screen", (percent, message) => {
      console.log(`⏳ Loading WhatsApp... ${percent}% ${message || ''} `);
    });

    // 3. User successfully scanned the QR or loaded saved cookies
    this.client.on("authenticated", () => {
      console.log("✅ Authenticated!");
    });

    // Error catching
    this.client.on("auth_failure", (msg) => {
      console.error("❌ Authentication failure:", msg);
    });

    // 4. Client is fully synced and ready to receive/send messages
    this.client.on("ready", () => {
      this.isReady = true;
      console.log("✅ WhatsApp client is ready! The bot is now running.");
    });

    // 5. Triggered on EVERY incoming message
    this.client.on("message_create", this.onMessage.bind(this));

    // 6. Handle disconnections (e.g., user logged out from phone)
    this.client.on("disconnected", (reason) => {
      console.log("🔌 WhatsApp client was disconnected:", reason);
      process.exit(1); // Crash app gracefully to allow Railway to auto-restart it
    });
  }

  /**
   * Evaluates messages and drops them if they are from group chats or self
   * @param {Object} message - Incoming WhatsApp Message payload
   */
  async onMessage(message) {
    if (!this.isReady) {
      console.log(`⏳ Ignoring message from ${message.from} because bot is not ready.`);
      return;
    }

    const chat = await message.getChat();
    // NOTE: Ignore self messages and group chat messages to prevent spam loops
    if (message.fromMe || chat.isGroup || !message.body) return;

    // Contact identification
    let contactName = "Unknown";
    let contactNumber = message.from;

    try {
      const contact = await message.getContact();
      contactName = contact.pushname || contact.name || "Unknown";
      contactNumber = contact.number || message.from;
    } catch (err) {
      console.warn(`⚠️ Could not retrieve contact details for ${message.from}`);
    }

    console.log(`\n📬 Message received from ${contactName} (${contactNumber}): "${message.body}"`);

    try {
      // NOTE: Pass the filtered valid message completely to the AI handler!
      await handleMessage(message, chat);
    } catch (error) {
      console.error("A critical error occurred in the message handler:", error);
      await chat.clearState(); // Turn off "Typing..."
      await message.reply("🆘 Oops! A critical error occurred. Please try again later.");
    }
  }
}

module.exports = WhatsAppManager;
