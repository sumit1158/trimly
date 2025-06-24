import twilio from 'twilio';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, SMS_ENABLED } from '../config/twilio.js';

// Initialize Twilio client
const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
const fromNumber = TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

class SMSService {
  // Send SMS to a single number
  static async sendSMS(to, message) {
    try {
      // Check if SMS is enabled
      if (!SMS_ENABLED) {
        console.log('SMS is disabled, skipping SMS send');
        return { success: true, messageId: 'sms-disabled', disabled: true };
      }

      // Validate phone number first
      if (!to) {
        console.error('Phone number is required for SMS');
        return { success: false, error: 'Phone number is required' };
      }

      // Convert to string and trim whitespace
      const phoneString = String(to).trim();
      
      if (!phoneString || phoneString === 'undefined' || phoneString === 'null') {
        console.error('Invalid phone number provided:', to);
        return { success: false, error: 'Invalid phone number provided' };
      }

      // Validate phone number format
      if (!this.validatePhoneNumber(phoneString)) {
        console.error('Invalid phone number format:', phoneString);
        return { success: false, error: 'Invalid phone number format' };
      }

      if (!accountSid || !authToken || !fromNumber) {
        console.error('Twilio credentials not configured');
        return { success: false, error: 'SMS service not configured' };
      }

      // Format phone number (add +91 if it's an Indian number)
      let formattedNumber = phoneString;
      if (phoneString.startsWith('9') && phoneString.length === 10) {
        formattedNumber = `+91${phoneString}`;
      } else if (phoneString.startsWith('+91')) {
        formattedNumber = phoneString;
      } else if (!phoneString.startsWith('+')) {
        formattedNumber = `+${phoneString}`;
      }

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedNumber
      });

      console.log(`SMS sent successfully to ${formattedNumber}:`, result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Send booking confirmation SMS
  static async sendBookingConfirmation(appointment) {
    const message = `Sent from your Twilio trial account - Hi ${appointment.customerName}, your ${appointment.service} booking on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} is confirmed. Barber: ${appointment.barberName}. Price: ₹${appointment.price}`;
    
    return await this.sendSMS(appointment.customerPhone, message);
  }

  // Send appointment reminder SMS
  static async sendAppointmentReminder(appointment) {
    const message = `Sent from your Twilio trial account - Hi ${appointment.customerName}, reminder: your ${appointment.service} appointment is in 2 hours on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}. Barber: ${appointment.barberName}`;
    
    return await this.sendSMS(appointment.customerPhone, message);
  }

  // Send queue update SMS
  static async sendQueueUpdate(queueItem, position) {
    const message = `Sent from your Twilio trial account - Hi ${queueItem.customerName}, you are position #${position} in queue for ${queueItem.service}. Estimated wait: ${this.calculateWaitTime(position)} minutes.`;
    
    return await this.sendSMS(queueItem.customerPhone, message);
  }

  // Send "your turn" SMS
  static async sendYourTurnSMS(queueItem) {
    const message = `Sent from your Twilio trial account - Hi ${queueItem.customerName}, it's your turn now! Please come for your ${queueItem.service}.`;
    
    return await this.sendSMS(queueItem.customerPhone, message);
  }

  // Send service completion SMS
  static async sendServiceCompletion(queueItem) {
    const message = `Sent from your Twilio trial account - Hi ${queueItem.customerName}, your ${queueItem.service} is complete. Thank you for choosing us!`;
    
    return await this.sendSMS(queueItem.customerPhone, message);
  }

  // Send cancellation SMS
  static async sendCancellation(appointment) {
    const message = `Sent from your Twilio trial account - Hi ${appointment.customerName}, your ${appointment.service} appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been cancelled.`;
    
    return await this.sendSMS(appointment.customerPhone, message);
  }

  // Send barber notification
  static async sendBarberNotification(barberPhone, message) {
    return await this.sendSMS(barberPhone, message);
  }

  // Calculate estimated wait time
  static calculateWaitTime(position) {
    // Rough estimate: 30 minutes per customer
    return position * 30;
  }

  // Validate phone number format
  static validatePhoneNumber(phone) {
    // Handle null/undefined values
    if (!phone) {
      return false;
    }
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid Indian mobile number (10 digits starting with 6,7,8,9)
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return true;
    }
    
    // Check if it's a valid international number
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      return true;
    }
    
    return false;
  }

  // Format phone number for display
  static formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    
    return phone;
  }
}

export default SMSService; 