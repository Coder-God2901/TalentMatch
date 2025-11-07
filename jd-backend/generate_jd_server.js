import express, { json } from 'express';
import cors from 'cors';
import { generateJD } from './generate_jd.js';

const app = express();
app.use(cors());
app.use(json());

app.post('/generate_jd', async (req, res) => {
  try {
    const payload = req.body || {};
    const out = await generateJD(payload);
    return res.json(out);
  } catch (err) {
    console.error('local generate_jd error', err);
    return res.status(500).json({ error: 'local JD generation failed' });
  }
});

const PORT = process.env.DEV_JD_PORT || 5577;
app.listen(PORT, () => {
  console.log(`local generate_jd server running on http://localhost:${PORT}`);
});