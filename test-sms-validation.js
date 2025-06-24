// Test script for SMS phone number validation
import SMSService from './src/server/services/smsService.js';

console.log('Testing SMS phone number validation...\n');

// Test cases
const testCases = [
  { phone: '9876543210', expected: true, description: 'Valid Indian mobile number' },
  { phone: '+919876543210', expected: true, description: 'Valid Indian mobile with country code' },
  { phone: '+1234567890', expected: true, description: 'Valid international number' },
  { phone: undefined, expected: false, description: 'Undefined phone number' },
  { phone: null, expected: false, description: 'Null phone number' },
  { phone: '', expected: false, description: 'Empty string' },
  { phone: '123', expected: false, description: 'Too short' },
  { phone: '1234567890123456', expected: false, description: 'Too long' },
  { phone: 'abcdefghij', expected: false, description: 'Non-numeric characters' },
  { phone: '1234567890', expected: false, description: 'Invalid Indian mobile (starts with 1)' },
];

// Test validation function
console.log('Testing validatePhoneNumber function:');
testCases.forEach((testCase, index) => {
  try {
    const result = SMSService.validatePhoneNumber(testCase.phone);
    const passed = result === testCase.expected;
    console.log(`${index + 1}. ${testCase.description}: ${passed ? '✅ PASS' : '❌ FAIL'} (${testCase.phone} -> ${result})`);
  } catch (error) {
    console.log(`${index + 1}. ${testCase.description}: ❌ ERROR - ${error.message}`);
  }
});

console.log('\nTesting sendSMS function with invalid inputs:');

// Test sendSMS with invalid inputs
const invalidInputs = [undefined, null, '', 'invalid'];

invalidInputs.forEach((input, index) => {
  console.log(`\nTest ${index + 1}: Testing sendSMS with "${input}"`);
  try {
    // This should not throw an error now
    SMSService.sendSMS(input, 'Test message').then(result => {
      console.log(`Result: ${result.success ? 'Success' : 'Failed'} - ${result.error || 'No error'}`);
    }).catch(error => {
      console.log(`Error: ${error.message}`);
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
});

console.log('\nValidation tests completed!'); 