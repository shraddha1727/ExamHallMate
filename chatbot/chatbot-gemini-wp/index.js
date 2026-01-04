require('dotenv').config({ path: '../../.env' }); // Load root .env
require('dotenv').config(); // Load local .env (overrides if exists)

const WhatsAppManager = require('./whatsapp-manager.js');

console.log('Starting AI Chatbot Application...');

const bot = new WhatsAppManager();
bot.initialize();

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