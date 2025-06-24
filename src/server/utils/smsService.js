import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to
    });
    
    console.log('SMS sent successfully:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// Predefined message templates
export const messageTemplates = {
  appointmentReminder: (customerName, appointmentTime, barberName) => 
    `Hi ${customerName}, this is a reminder for your appointment with ${barberName} at ${appointmentTime}. See you soon!`,
  
  appointmentConfirmation: (customerName, appointmentTime, barberName) =>
    `Hi ${customerName}, your appointment with ${barberName} has been confirmed for ${appointmentTime}. Thank you for choosing our service!`,
  
  appointmentCancellation: (customerName, appointmentTime, barberName) =>
    `Hi ${customerName}, your appointment with ${barberName} scheduled for ${appointmentTime} has been cancelled. Please contact us if you need to reschedule.`,
  
  welcomeMessage: (customerName) =>
    `Welcome to Trimly, ${customerName}! Thank you for registering. We're excited to help you find the perfect barber.`,
  
  barberWelcome: (barberName) =>
    `Welcome to Trimly, ${barberName}! Your barber account has been created. You can now start accepting appointments.`
}; 