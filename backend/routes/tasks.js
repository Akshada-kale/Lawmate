const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware, requireRole('lawyer'));

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, case:cases(id,case_number,title)`)
      .eq('lawyer_id', req.user.id)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return res.json({ success: true, tasks: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { case_id, title, description, due_date, priority } = req.body;
    if (!case_id || !title) return res.status(400).json({ success: false, message: 'case_id and title required' });

    const { data, error } = await supabase.from('tasks')
      .insert({ case_id, lawyer_id: req.user.id, title, description: description||null, due_date: due_date||null, priority: priority||'medium' })
      .select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Task created', task: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description, due_date, priority, status } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (title)       updates.title = title;
    if (description) updates.description = description;
    if (due_date)    updates.due_date = due_date;
    if (priority)    updates.priority = priority;
    if (status)      updates.status = status;

    const { data, error } = await supabase.from('tasks').update(updates).eq('id', req.params.id).eq('lawyer_id', req.user.id).select().single();
    if (error) throw error;
    return res.json({ success: true, message: 'Task updated', task: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', req.params.id).eq('lawyer_id', req.user.id);
    if (error) throw error;
    return res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
