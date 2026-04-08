const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware, requireRole('lawyer'));

// GET /api/clients  - get all clients (approved + pending)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id,email,full_name,phone,city,address,is_approved,created_at')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, clients: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id,email,full_name,phone,city,address,is_approved,created_at')
      .eq('id', req.params.id)
      .eq('role', 'client')
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Client not found' });
    return res.json({ success: true, client: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/clients/:id/approve
router.put('/:id/approve', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('role', 'client')
      .select()
      .single();

    if (error) throw error;

    // Notify client
    await supabase.from('notifications').insert({
      user_id: req.params.id,
      title: 'Account Approved',
      message: 'Your account has been approved by the lawyer. You can now access your dashboard.',
      type: 'info'
    });

    return res.json({ success: true, message: 'Client approved', client: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/clients/:id/reject  (set is_approved=false)
router.put('/:id/reject', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_approved: false, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('role', 'client')
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, message: 'Client rejected', client: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
