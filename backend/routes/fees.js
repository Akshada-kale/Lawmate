const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/fees
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('fees')
      .select(`*, case:cases(id,case_number,title), client:users!fees_client_id_fkey(id,full_name)`)
      .order('created_at', { ascending: false });

    if (req.user.role === 'lawyer') {
      query = query.eq('lawyer_id', req.user.id);
    } else {
      query = query.eq('client_id', req.user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, fees: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/fees  (lawyer only)
router.post('/', requireRole('lawyer'), async (req, res) => {
  try {
    const { case_id, client_id, total_fee, paid_amount } = req.body;
    if (!case_id || !client_id || total_fee === undefined) {
      return res.status(400).json({ success: false, message: 'case_id, client_id, total_fee required' });
    }

    const paid = paid_amount || 0;
    const pending = total_fee - paid;
    const status = paid >= total_fee ? 'paid' : paid > 0 ? 'partial' : 'pending';

    const { data, error } = await supabase.from('fees')
      .insert({ case_id, client_id, lawyer_id: req.user.id, total_fee, paid_amount: paid, status })
      .select().single();

    if (error) throw error;

    // Notify client
    await supabase.from('notifications').insert({
      user_id: client_id,
      title: 'Fee Record Added',
      message: `A fee of ₹${total_fee} has been recorded for your case. Paid: ₹${paid}. Pending: ₹${pending}.`,
      type: 'fee'
    });

    return res.status(201).json({ success: true, message: 'Fee record created', fee: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/fees/:id  (lawyer only)
router.put('/:id', requireRole('lawyer'), async (req, res) => {
  try {
    const { total_fee, paid_amount } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (total_fee   !== undefined) updates.total_fee = total_fee;
    if (paid_amount !== undefined) {
      updates.paid_amount = paid_amount;
      const tf = total_fee || (await supabase.from('fees').select('total_fee').eq('id', req.params.id).single()).data?.total_fee;
      updates.status = paid_amount >= tf ? 'paid' : paid_amount > 0 ? 'partial' : 'pending';
    }

    const { data, error } = await supabase.from('fees').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Notify client
    await supabase.from('notifications').insert({
      user_id: data.client_id,
      title: 'Fee Record Updated',
      message: `Your fee record has been updated. Paid: ₹${data.paid_amount}. Status: ${data.status}.`,
      type: 'fee'
    });

    return res.json({ success: true, message: 'Fee updated', fee: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
