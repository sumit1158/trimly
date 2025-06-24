export function isValidIndianPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 && /^[6-9]/.test(cleaned);
}

export function validateIndianPhoneMiddleware(req, res, next) {
  const phone = req.body.phone;
  if (!isValidIndianPhone(phone)) {
    return res.status(400).json({ message: 'Invalid Indian phone number format.' });
  }
  next();
} 