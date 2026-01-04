require('dotenv').config({ path: '../../.env' }); // Load root .env
require('dotenv').config(); // Load local .env (overrides if exists)

const WhatsAppManager = require('./whatsapp-manager.js');

const express = require('express');

console.log('Starting AI Chatbot Application...');

const bot = new WhatsAppManager();
bot.initialize();

// --- WEB SERVER FOR QR CODE ---
const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('WhatsApp Bot is active! Go to <a href="/qr">/qr</a> to scan login code.');
});

app.get('/qr', (req, res) => {
    const qr = bot.qrCodeData;
    if (!qr) {
        return res.send(`
            <html>
                <head><meta http-equiv="refresh" content="5"></head>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>Waiting for QR Code...</h1>
                    <p>Please wait, initializing WhatsApp...</p>
                    <p>Page will auto-refresh every 5 seconds.</p>
                </body>
            </html>
        `);
    }

    // Use a public API to generate QR image from the string
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`;

    res.send(`
        <html>
            <head><meta http-equiv="refresh" content="15"></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>Scan this QR Code</h1>
                <p>Open WhatsApp > Settings > Linked Devices > Link a Device</p>
                <img src="${qrImageUrl}" alt="WhatsApp Login QR Code" style="border: 2px solid #ccc; padding: 10px; border-radius: 10px;" />
                <br><br>
                <p style="color: #666;">Raw String (if image fails): <br> <code style="background: #eee; padding: 5px;">${qr.substring(0, 20)}...</code></p>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`🌐 Web Server running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
    if (
        (err.code === 'EBUSY' && err.syscall === 'unlink') ||
        (err.message && err.message.includes('EBUSY'))
    ) {
        console.warn('⚠️  Warning: Failed to delete a session file due to a file lock. This is common during restarts and can usually be ignored.');
    } else {
        console.error('An unhandled error occurred:', err);
        process.exit(1);
    }
});