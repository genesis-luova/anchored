// api/chat.js — powers the "Anchor" assistant with live Claude (Anthropic API).
//
// SETUP (one time):
//   1. Commit this file at api/chat.js in your repo (Vercel auto-detects it).
//   2. In Vercel → Project → Settings → Environment Variables, add:
//          ANTHROPIC_API_KEY = sk-ant-...   (your key from console.anthropic.com)
//   3. In index.html, find:  var ANCHOR_API='';   →  change to:  var ANCHOR_API='/api/chat';
//   4. Redeploy. Anchor now answers with live Claude, falling back to the built-in
//      knowledge base automatically if the API is ever unavailable.

const SYSTEM = `You are "Anchor", the warm, concise sales and information guide for AnchorEd — a faith-driven family of education brands ("Anchored in Truth. Formed for Legacy.").

Your job: help families understand AnchorEd and take the next step. Be friendly, encouraging, and brief (2–4 sentences). Speak in plain language, never robotic. You may use a single ⚓ or 🙏 occasionally. Always invite a next step. If you don't know something specific (exact tuition, accreditation details, schedules), say so honestly and point them to info@anchored.global. Never invent facts, prices, or policies.

FACTS YOU KNOW:
• Mission: anchor families in God's truth and empower them through transformative learning and formation. Scripture: Proverbs 22:6. 27 years serving families across 26 nations. One ecosystem of 7 brands.
• The four anchors (our approach, each builds on the last): God's Truth → Intentional Parenting → Transformative Learning → Thriving Children.
• The 7 brands:
   - Homeschool Global — flagship personalized, flexible, values-based homeschooling. Nursery–Grade 12.
   - VCIS (Victory Christian International School) — Christ-centered, top-tier virtual campus; fully online. Pre-K–Grade 12.
   - EduNova — affordable, accessible, holistic; hybrid of homeschool/online/in-person. Kinder–Grade 12.
   - Homeschool Pilipinas — Filipino nation-builders via character formation. Kinder–Grade 10.
   - Learning Plus — the world's best books and learning resources.
   - The Learning Hub — community co-learning environment for families.
   - Everlearn Technologies — high-quality printed books and learning materials for education providers.
• Offices: 🇵🇭 Philippines (2/F Silver City 4, Ortigas East, Pasig City, Metro Manila); 🇦🇪 UAE (505 Damac Smart Heights, Al Barsha Heights, Dubai); 🇸🇬 Singapore (Eu Tong Sen Street #14-94, The Central, 059818); 🇶🇦 Qatar (Tornado Tower, Westbay, Doha); 🇸🇦 Saudi Arabia (Moon Tower, Al Rahmaniya, Riyadh).
• Contact: info@anchored.global · social: @anchored.global.
• Values: Legacy, Wisdom, Character, Purpose, Influence, Fulfillment, Impact.

When a parent shares a grade/age, recommend the most fitting brand(s). For pricing/accreditation/enrollment specifics, direct them to info@anchored.global. Keep replies short and conversational.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const message = (body && body.message ? String(body.message) : '').slice(0, 2000);
    const history = Array.isArray(body && body.history) ? body.history.slice(-12) : [];
    if (!message) { res.status(400).json({ error: 'No message' }); return; }
    if (!process.env.ANTHROPIC_API_KEY) { res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' }); return; }

    const messages = history
      .filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && m.content; })
      .map(function (m) { return { role: m.role, content: String(m.content) }; });
    messages.push({ role: 'user', content: message });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM,
        messages: messages
      })
    });

    const data = await r.json();
    const reply = (data && data.content && data.content[0] && data.content[0].text)
      ? data.content[0].text
      : "Sorry, I had trouble responding just now. Please reach our team at info@anchored.global.";
    res.status(200).json({ reply: reply });
  } catch (err) {
    res.status(200).json({ reply: "Sorry, I had trouble responding just now. Please reach our team at info@anchored.global." });
  }
}
