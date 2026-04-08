const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../config/supabase');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Multer: store files in memory, max 10MB
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function notify(user_id, title, message) {
  await supabase.from('notifications').insert({ user_id, title, message, type: 'document' });
}

// GET /api/documents  - list documents for user's cases
router.get('/', async (req, res) => {
  try {
    const { data: docs, error } = await supabase
      .from('documents')
      .select(`*, case:cases(id,case_number,title,client_id,lawyer_id), uploader:users!documents_uploaded_by_fkey(full_name)`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const filtered = docs.filter(d => {
      if (!d.case) return false;
      if (req.user.role === 'lawyer') return d.case.lawyer_id === req.user.id;
      return d.case.client_id === req.user.id;
    });

    return res.json({ success: true, documents: filtered });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/documents/upload  (lawyer only)
router.post('/upload', requireRole('lawyer'), upload.single('file'), async (req, res) => {
  try {
    const { case_id, doc_type } = req.body;
    if (!req.file || !case_id || !doc_type) {
      return res.status(400).json({ success: false, message: 'file, case_id and doc_type required' });
    }

    // Verify lawyer owns this case
    const { data: c } = await supabase.from('cases').select('lawyer_id,client_id,case_number').eq('id', case_id).single();
    if (!c || c.lawyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Upload to Supabase Storage
    const fileName = `${case_id}/${Date.now()}_${req.file.originalname}`;
    const bucket = process.env.STORAGE_BUCKET || 'lawmate-documents';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    const file_url = urlData.publicUrl;

    // Size in KB/MB
    const kb = req.file.size / 1024;
    const file_size = kb > 1024 ? `${(kb/1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;

    // Save document record
    const { data: doc, error } = await supabase.from('documents')
      .insert({ case_id, uploaded_by: req.user.id, name: req.file.originalname, doc_type, file_url, file_size })
      .select().single();

    if (error) throw error;

    // Notify client
    if (c.client_id) {
      await notify(c.client_id, 'Document Uploaded', `A new document "${req.file.originalname}" has been uploaded for case ${c.case_number}.`);
    }

    return res.status(201).json({ success: true, message: 'Document uploaded', document: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// DELETE /api/documents/:id  (lawyer only)
router.delete('/:id', requireRole('lawyer'), async (req, res) => {
  try {
    const { error } = await supabase.from('documents').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
