const { Client, RemoteAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { handleMessage } = require("./ai-handler.js");
const mongoose = require('mongoose');
const { MongoStore } = require('wwebjs-mongo');

class WhatsAppManager {
  constructor() {
    this.client = null;
    this.qrCodeData = null;
  }

  async initialize() {
    console.log("🚀 Initializing MongoDB connection for WhatsApp Session...");

    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("✅ Connected to MongoDB (Mongoose)");

      const store = new MongoStore({ mongoose: mongoose });

      this.client = new Client({
        authStrategy: new RemoteAuth({
          store: store,
          backupSyncIntervalMs: 30000 // Save every 30 seconds to prevent loss on restart
        }),
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        },
        puppeteer: {
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu",
          ],
          timeout: 60000,
        },
      });

      this.setupEventHandlers();
      console.log("🚀 Starting WhatsApp Client...");
      this.client.initialize();

    } catch (err) {
      console.error("❌ Failed to connect to MongoDB/WhatsApp:", err);
    }
  }

  setupEventHandlers() {
    this.client.on("qr", (qr) => {
      this.qrCodeData = qr; // Update stored QR code
      console.log("👉 QR Code received! Please scan it with WhatsApp:");
      console.log("If the QR below is distorted, COPY THIS CODE and generate one online (https://www.the-qrcode-generator.com/):");
      console.log(`RAW_QR_CODE: ${qr}`);
      qrcode.generate(qr, { small: true });
    });
    this.client.on("remote_session_saved", () => {
      console.log("💾 Session saved successfully!");
    });
    this.client.on("loading_screen", (percent, message) => {
      console.log(`⏳ Loading WhatsApp... ${percent}% ${message || ''} `);
    });
    this.client.on("authenticated", () => {
      console.log("✅ Authenticated!");
    });
    this.client.on("auth_failure", (msg) => {
      console.error("❌ Authentication failure:", msg);
    });
    this.client.on("ready", () =>
      console.log("✅ WhatsApp client is ready! The bot is now running.")
    );
    this.client.on("message", this.onMessage.bind(this));
    this.client.on("disconnected", (reason) => {
      console.log("🔌 WhatsApp client was disconnected:", reason);
      process.exit(1);
    });
  }

  async onMessage(message) {
    const chat = await message.getChat();
    if (chat.isGroup || !message.body) return;

    let contactName = "Unknown";
    let contactNumber = message.from;

    try {
      const contact = await message.getContact();
      contactName = contact.pushname || contact.name || "Unknown";
      contactNumber = contact.number || message.from;
    } catch (err) {
      const errorMsg = err.message.includes('Evaluation failed')
        ? 'Contact info unavailable (WA Web selector issue)'
        : err.message;
      console.warn(`⚠️ Could not retrieve contact details for ${message.from}: ${errorMsg} `);
    }

    console.log(
      `\n📬 Message received from ${contactName} (${contactNumber}): "${message.body}"`
    );

    try {
      // We pass the message AND the chat object to the handler.
      // The handler will now be responsible for managing the "typing" state.
      await handleMessage(message, chat);
    } catch (error) {
      console.error("A critical error occurred in the message handler:", error);
      await chat.clearState(); // Ensure typing is cleared on error
      await message.reply(
        "🆘 Oops! A critical error occurred. Please try again later."
      );
    }
  }


}

module.exports = WhatsAppManager;
