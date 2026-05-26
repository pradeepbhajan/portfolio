import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Supabase client — service_role key for bypassing RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

// ── Auth middleware ──────────────────────────────────────────
function requireAdmin(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ── GET /api/portfolio — public, all devices ────────────────
app.get('/api/portfolio', async (req, res) => {
  const { data, error } = await supabase
    .from('portfolio_images')
    .select('*')
    .order('position', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── POST /api/portfolio/upload — admin only ──────────────────
app.post('/api/portfolio/upload', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'portfolio', resource_type: 'image' },
        (err, result) => err ? reject(err) : resolve(result)
      ).end(req.file.buffer);
    });

    // Save URL to Supabase
    const { data, error } = await supabase
      .from('portfolio_images')
      .insert({
        url: result.secure_url,
        public_id: result.public_id,
        label: req.body.label || '',
        category: req.body.category || 'all',
        position: Date.now(),
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/portfolio/:id — update label/category ────────
app.patch('/api/portfolio/:id', requireAdmin, async (req, res) => {
  const { label, category } = req.body;
  const { data, error } = await supabase
    .from('portfolio_images')
    .update({ label, category })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── DELETE /api/portfolio/:id ────────────────────────────────
app.delete('/api/portfolio/:id', requireAdmin, async (req, res) => {
  // Get public_id first to delete from Cloudinary
  const { data: img } = await supabase
    .from('portfolio_images')
    .select('public_id')
    .eq('id', req.params.id)
    .single();

  if (img?.public_id) {
    await cloudinary.uploader.destroy(img.public_id);
  }

  const { error } = await supabase
    .from('portfolio_images')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ── POST /api/profile-photo ──────────────────────────────────
app.post('/api/profile-photo', requireAdmin, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'portfolio', public_id: 'profile_photo', overwrite: true },
        (err, result) => err ? reject(err) : resolve(result)
      ).end(req.file.buffer);
    });

    // Save to settings table
    await supabase.from('portfolio_settings').upsert({ key: 'profile_photo', value: result.secure_url });
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/settings ────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  const { data } = await supabase.from('portfolio_settings').select('*');
  const settings = {};
  (data || []).forEach(row => { settings[row.key] = row.value; });
  res.json(settings);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Portfolio server running on http://localhost:${PORT}`));
