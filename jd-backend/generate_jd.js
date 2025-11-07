/**
 * generate_jd.js
 * - exports: async generateJD(payload)
 * - If GEMINI_API_KEY present and @google/generative-ai installed, calls Gemini.
 * - Otherwise falls back to a deterministic composer that ONLY uses supplied inputs.
 *
 * Payload shape (same as Edge Function spec):
 * {
 *   company: { name, description, website },
 *   title,
 *   role,
 *   raw_jd,
 *   skills: [..],
 *   location,
 *   salary
 * }
 */
import {GoogleGenerativeAI} from '@google/generative-ai' 

const MAX_COMPANY_DESC = 500;

function truncate(str, n = 400) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n).trim() + '…' : str.trim();
}

function deterministicCompose({ company = {}, title, role, raw_jd = '', skills = [], location, salary }) {
  const compName = company?.name || '';
  const compDesc = truncate(company?.description || '', MAX_COMPANY_DESC);

  // normalize raw JD lines
  const lines = raw_jd
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  // Responsibilities: prefer dashed list in raw_jd, else take sentences with common verbs
  const dashed = lines.filter(l => /^[-•*]\s+/.test(l) || /^[0-9]+\./.test(l)).map(l => l.replace(/^[-•*]\s+/, '').replace(/^[0-9]+\.\s+/, ''));
  let responsibilities = dashed;
  if (responsibilities.length === 0) {
    const sentences = raw_jd.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);
    const verbs = ['develop', 'build', 'design', 'lead', 'manage', 'collaborate', 'implement', 'maintain', 'optimize', 'deliver', 'own'];
    responsibilities = sentences.filter(s => verbs.some(v => s.toLowerCase().includes(v))).slice(0, 6);
  }
  if (responsibilities.length === 0 && raw_jd) {
    responsibilities = [truncate(raw_jd, 300)];
  }

  // Requirements: use explicit skills first, then sentences that mention years/experience/required
  const reqs = [];
  if (Array.isArray(skills) && skills.length) {
    for (const s of skills) {
      reqs.push(s);
    }
  }
  const reqSent = (raw_jd.match(/(requirements|must have|must|required|experience|years|proficient|proficiency)[^.\n]*/gi) || []);
  for (const s of reqSent.slice(0, 4)) reqs.push(s.trim());
  // dedupe and limit
  const uniqueReqs = Array.from(new Set(reqs)).slice(0, 12);

  // Nice to have: look for "nice to have", "prefer", "bonus" mentions
  const nice = lines.filter(l => /nice to have|prefer|bonus|familiar|experience with/i.test(l)).slice(0, 6);

  const sections = [];

  // About the Company
  if (compName || compDesc) {
    sections.push(`About the Company\n${compName ? compName + ' — ' : ''}${compDesc || '—'}`);
  }

  // Role Overview
  const roleTitle = title || role || '—';
  sections.push(`Role Overview\nAs a ${roleTitle}, you will ${responsibilities.length ? 'focus on the following:' : 'work closely with the product and engineering teams.'}`);

  // Key Responsibilities
  sections.push('Key Responsibilities\n' + responsibilities.map(r => `- ${truncate(r, 240)}`).join('\n'));

  // Requirements
  if (uniqueReqs.length) {
    sections.push('Requirements\n' + uniqueReqs.map(r => `- ${r}`).join('\n'));
  } else {
    // extract short requirement-like sentences
    const reqFallback = raw_jd.split(/(?<=[.?!])\s+/).filter(s => /experience|proficient|knowledge|degree|years/i.test(s)).slice(0, 6);
    if (reqFallback.length) sections.push('Requirements\n' + reqFallback.map(r => `- ${truncate(r, 180)}`).join('\n'));
  }

  // Nice to Have
  if (nice.length) {
    sections.push('Nice to Have\n' + nice.map(n => `- ${truncate(n, 180)}`).join('\n'));
  }

  // Location & Compensation
  const loc = location || 'Not specified';
  const comp = salary || 'Not specified';
  sections.push(`Location, Compensation & Work Type\nLocation: ${loc}\nCompensation: ${comp}\nWork Type: ${/remote|hybrid|on[- ]?site/i.test(raw_jd) ? (raw_jd.match(/remote|hybrid|on[- ]?site/i)[0]) : 'Not specified'}`);

  // join sections and ensure length cap (~1200 chars)
  const jd = sections.join('\n\n');
  return truncate(jd, 1200);
}

async function callGeminiIfAvailable(payload) {
  const key = process.env.GEMINI_API_KEY || process.env.GENERATIVE_AI_API_KEY;
  if (!key) {
    throw new Error('no_gemini_key');
  }

  // instantiation - support both constructor signatures
  let client;
  try {
    client = new GoogleGenerativeAI({ apiKey: key });
  } catch (e) {
    try {
      client = new GoogleGenerativeAI(key);
    } catch (err) {
      throw new Error('gemini_init_failed');
    }
  }

  const model = client.getGenerativeModel ? client.getGenerativeModel({ model: 'gemini-1.5-flash' }) : client.model?.('gemini-1.5') || client;

  const prompt = `
You are an expert technical HR assistant.
Task: convert the recruiter's raw job description into a structured, concise job posting.
Rules:
- Use ONLY the details provided. DO NOT add new skills/tools/requirements.
- Keep under 350 words.
- Use sections: About the Company; Role Overview; Key Responsibilities; Requirements (only from input); Nice to Have (only if present); Location, Compensation, Work Type.
Company Name: ${payload.company?.name || "N/A"}
Company Description: ${payload.company?.description || "N/A"}
Role Title: ${payload.title || payload.role || "N/A"}
Location: ${payload.location || "N/A"}
Salary: ${payload.salary || "N/A"}
Skills Required: ${Array.isArray(payload.skills) ? payload.skills.join(", ") : payload.skills || "N/A"}
Raw JD:
${payload.raw_jd || ""}
Now produce a single plain-text refined job description (no external links), obey rules.
`;

  // best-effort call - SDKs vary; try common patterns
  try {
    if (typeof model.generateContent === 'function') {
      const res = await model.generateContent(prompt);
      // prefer response.text() if available
      if (res?.response?.text && typeof res.response.text === 'function') {
        return await res.response.text();
      }
      if (res?.outputText) return res.outputText;
      if (typeof res === 'string') return res;
      return JSON.stringify(res);
    }

    // fallback: some SDKs use `model.predict` or `client.generate`
    if (typeof client.generate === 'function') {
      const out = await client.generate({ model: 'gemini-1.5-flash', prompt });
      if (out?.candidates?.[0]?.content) return out.candidates[0].content;
      if (out?.outputText) return out.outputText;
    }

    throw new Error('unsupported_gemini_sdk');
  } catch (err) {
    throw err;
  }
}

/**
 * Public entry: generateJD(payload)
 * - tries Gemini if available, otherwise deterministic
 * - always returns { generated_jd: string }
 */
export async function generateJD(payload) {
  // Guarantee we never hallucinate: if Gemini used, the prompt forces "use only details provided".
  // If Gemini call fails, deterministicCompose will be used.
  try {
    const key = process.env.GEMINI_API_KEY || process.env.GENERATIVE_AI_API_KEY;
    if (key) {
      try {
        const text = await callGeminiIfAvailable(payload);
        if (text && text.trim()) {
          // Trim long outputs
          const trimmed = truncate(text, 1400);
          return { generated_jd: trimmed };
        }
      } catch (err) {
        // fallthrough to deterministic on any gemini error
        // keep logging for debugging
        console.warn('Gemini call failed, falling back to deterministic composer:', err?.message || err);
      }
    }
  } catch (e) {
    console.warn('generateJD gemini attempt failed', e?.message || e);
  }

  // deterministic fallback
  const jd = deterministicCompose(payload);
  return { generated_jd: jd };
}
