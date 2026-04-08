const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Helper: create notification for user
async function notify(user_id, title, message, type = 'case') {
  await supabase.from('notifications').insert({ user_id, title, message, type });
}

// ── GET /api/cases  ───────────────────────────────────────────
// Lawyer sees all their cases; Client sees only their cases
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('cases')
      .select(`*, lawyer:users!cases_lawyer_id_fkey(id,full_name,email), client:users!cases_client_id_fkey(id,full_name,email,phone,city)`)
      .order('created_at', { ascending: false });

    if (req.user.role === 'lawyer') {
      query = query.eq('lawyer_id', req.user.id);
    } else {
      query = query.eq('client_id', req.user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, cases: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/cases/:id ────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select(`*, lawyer:users!cases_lawyer_id_fkey(id,full_name,email,phone), client:users!cases_client_id_fkey(id,full_name,email,phone,city)`)
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Case not found' });

    // Access check
    if (req.user.role === 'client' && data.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user.role === 'lawyer' && data.lawyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({ success: true, case: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/cases  (lawyer only) ───────────────────────────
router.post('/', requireRole('lawyer'), async (req, res) => {
  try {
    const { case_number, title, case_type, description, description_simple,
            court, priority, filing_date, client_id } = req.body;

    if (!case_number || !title || !case_type) {
      return res.status(400).json({ success: false, message: 'case_number, title, case_type are required' });
    }

    const { data, error } = await supabase
      .from('cases')
      .insert({
        case_number, title, case_type,
        description: description || null,
        description_simple: description_simple || null,
        court: court || null,
        priority: priority || 'medium',
        filing_date: filing_date || null,
        lawyer_id: req.user.id,
        client_id: client_id || null,
        stage_step: 1,
        status: 'filed'
      })
      .select()
      .single();

    if (error) throw error;

    // Notify client if assigned
    if (client_id) {
      await notify(client_id, 'New Case Assigned', `A new case "${title}" (${case_number}) has been assigned to you.`, 'case');
    }

    return res.status(201).json({ success: true, message: 'Case created', case: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/cases/:id  (lawyer only) ────────────────────────
router.put('/:id', requireRole('lawyer'), async (req, res) => {
  try {
    const { title, case_type, description, description_simple,
            court, priority, status, stage_step, next_hearing, client_id } = req.body;

    // Only the owning lawyer can edit
    const { data: existing } = await supabase.from('cases').select('lawyer_id,client_id,title').eq('id', req.params.id).single();
    if (!existing || existing.lawyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (title)               updates.title = title;
    if (case_type)           updates.case_type = case_type;
    if (description)         updates.description = description;
    if (description_simple !== undefined) updates.description_simple = description_simple;
    if (court)               updates.court = court;
    if (priority)            updates.priority = priority;
    if (status)              { updates.status = status; updates.stage_step = ['filed','hearing','evidence','judgment','closed'].indexOf(status)+1; }
    if (stage_step)          updates.stage_step = stage_step;
    if (next_hearing)        updates.next_hearing = next_hearing;
    if (client_id !== undefined) updates.client_id = client_id;

    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Notify client about case update
    const notifClientId = client_id || existing.client_id;
    if (notifClientId) {
      await notify(notifClientId, 'Case Updated', `Your case "${existing.title}" has been updated.`, 'case');
    }

    return res.json({ success: true, message: 'Case updated', case: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── DELETE /api/cases/:id  (lawyer only) ─────────────────────
router.delete('/:id', requireRole('lawyer'), async (req, res) => {
  try {
    const { data: existing } = await supabase.from('cases').select('lawyer_id').eq('id', req.params.id).single();
    if (!existing || existing.lawyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const { error } = await supabase.from('cases').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ success: true, message: 'Case deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
