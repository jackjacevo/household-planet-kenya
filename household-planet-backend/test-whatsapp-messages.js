const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleWhatsAppMessages() {
  try {
    console.log('Adding sample WhatsApp messages...');
    
    // Add some sample messages
    const messages = [
      {
        phoneNumber: '+254712345678',
        message: 'Hi, I want to order 2x cooking oil 1L and 1x rice 2kg. Please deliver to Karen.',
        timestamp: new Date(),
        messageId: 'msg_001',
        isOrderCandidate: true,
        processed: false
      },
      {
        phoneNumber: '+254798765432',
        message: 'Hello, can I buy 3x soap bars and 1x detergent? My address is Westlands.',
        timestamp: new Date(),
        messageId: 'msg_002',
        isOrderCandidate: true,
        processed: false
      },
      {
        phoneNumber: '+254701234567',
        message: 'Good morning, I need 1x sugar 2kg and 2x milk 500ml. Deliver to Kiambu.',
        timestamp: new Date(),
        messageId: 'msg_003',
        isOrderCandidate: true,
        processed: false
      }
    ];

    for (const message of messages) {
      await prisma.whatsAppMessage.create({
        data: message
      });
      console.log(`Added message from ${message.phoneNumber}`);
    }

    console.log('Sample WhatsApp messages added successfully!');
    
    // Verify the messages were added
    const count = await prisma.whatsAppMessage.count();
    console.log(`Total WhatsApp messages in database: ${count}`);
    
  } catch (error) {
    console.error('Error adding sample messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleWhatsAppMessages();