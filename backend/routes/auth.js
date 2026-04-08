const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// ── Helper: generate JWT ──────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, role,
            bar_reg_id, firm_name, city, address } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    if (!['lawyer', 'client'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Build user object
    const newUser = {
      email: email.toLowerCase(),
      password_hash,
      full_name,
      phone: phone || null,
      role,
      city: city || null,
      address: address || null,
      is_approved: role === 'lawyer' ? true : false // lawyers auto-approved; clients need lawyer to add them
    };

    if (role === 'lawyer') {
      newUser.bar_reg_id = bar_reg_id || null;
      newUser.firm_name = firm_name || null;
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (error) throw error;

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, is_approved: user.is_approved }
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, is_approved: user.is_approved }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
const { authMiddleware } = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id,email,full_name,phone,role,bar_reg_id,firm_name,experience,office_address,specializations,city,address,is_approved,created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { full_name, phone, city, address, firm_name, office_address, experience } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (full_name) updates.full_name = full_name;
    if (phone)     updates.phone = phone;
    if (city)      updates.city = city;
    if (address)   updates.address = address;
    if (firm_name) updates.firm_name = firm_name;
    if (office_address) updates.office_address = office_address;
    if (experience)     updates.experience = experience;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
