const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

async function notify(user_id, title, message, type='hearing') {
  await supabase.from('notifications').insert({ user_id, title, message, type });
}

// GET /api/hearings  - get all hearings for user
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('hearings')
      .select(`*, case:cases(id,case_number,title,client_id,lawyer_id)`)
      .order('hearing_date', { ascending: true });

    const { data: hearings, error } = await query;
    if (error) throw error;

    // Filter by user's cases
    const filtered = hearings.filter(h => {
      if (!h.case) return false;
      if (req.user.role === 'lawyer') return h.case.lawyer_id === req.user.id;
      return h.case.client_id === req.user.id;
    });

    return res.json({ success: true, hearings: filtered });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/hearings  (lawyer only)
router.post('/', requireRole('lawyer'), async (req, res) => {
  try {
    const { case_id, title, hearing_date, hearing_time, court_room, notes } = req.body;
    if (!case_id || !title || !hearing_date || !hearing_time) {
      return res.status(400).json({ success: false, message: 'case_id, title, hearing_date, hearing_time required' });
    }

    // Verify lawyer owns this case
    const { data: c } = await supabase.from('cases').select('lawyer_id,client_id,title,case_number').eq('id', case_id).single();
    if (!c || c.lawyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { data, error } = await supabase.from('hearings')
      .insert({ case_id, title, hearing_date, hearing_time, court_room: court_room||null, notes: notes||null })
      .select().single();

    if (error) throw error;

    // Update next_hearing on case
    await supabase.from('cases').update({ next_hearing: hearing_date, updated_at: new Date().toISOString() }).eq('id', case_id);

    // Notify client
    if (c.client_id) {
      await notify(c.client_id, 'Hearing Scheduled', `A hearing "${title}" has been scheduled on ${hearing_date} for case ${c.case_number}.`, 'hearing');
    }

    return res.status(201).json({ success: true, message: 'Hearing scheduled', hearing: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/hearings/:id  (lawyer only)
router.put('/:id', requireRole('lawyer'), async (req, res) => {
  try {
    const { title, hearing_date, hearing_time, court_room, status, notes } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (title)        updates.title = title;
    if (hearing_date) updates.hearing_date = hearing_date;
    if (hearing_time) updates.hearing_time = hearing_time;
    if (court_room)   updates.court_room = court_room;
    if (status)       updates.status = status;
    if (notes)        updates.notes = notes;

    const { data: h } = await supabase.from('hearings').select('case_id').eq('id', req.params.id).single();
    if (!h) return res.status(404).json({ success: false, message: 'Hearing not found' });

    const { data: c } = await supabase.from('cases').select('lawyer_id,client_id,case_number').eq('id', h.case_id).single();
    if (!c || c.lawyer_id !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    const { data, error } = await supabase.from('hearings').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;

    if (c.client_id && status) {
      await notify(c.client_id, 'Hearing Updated', `Hearing for case ${c.case_number} has been updated. Status: ${status}.`, 'hearing');
    }

    return res.json({ success: true, message: 'Hearing updated', hearing: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/hearings/:id  (lawyer only)
router.delete('/:id', requireRole('lawyer'), async (req, res) => {
  try {
    const { error } = await supabase.from('hearings').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ success: true, message: 'Hearing deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
