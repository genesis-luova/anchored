// api/chat.js — powers the "Anchor" assistant with live Claude (Anthropic API).
//
// SETUP (one time):
//   1. Commit this file at api/chat.js in your repo (Vercel auto-detects it).
//   2. In Vercel → Project → Settings → Environment Variables, add:
//          ANTHROPIC_API_KEY = sk-ant-...   (your key from console.anthropic.com)
//   3. js/chat-widget.js already sets  var ANCHOR_API='/api/chat'  — no change needed.
//   4. Redeploy. Anchor now answers with live Claude, falling back to the built-in
//      knowledge base automatically if the API is ever unavailable.
//
// RESPONSIBILITIES
//   • Accept POST {message, history} from js/chat-widget.js, forward the
//     conversation to the Anthropic Messages API with the AnchorEd persona,
//     and return {reply}.
//   • Clamp inputs (message ≤ 2000 chars, history ≤ last 12 turns) to bound
//     token spend and shrug off junk payloads.
//
// DOM/CSS CONTRACT
//   • None — server-side only. The client counterpart is js/chat-widget.js
//     (var ANCHOR_API='/api/chat'); it renders {reply} verbatim in the chat
//     log and treats any network error, non-2xx status, or missing reply
//     field as "API unavailable" (→ built-in knowledge base).
//
// GOTCHAS
//   • Two distinct failure shapes, on purpose:
//     – Config/validation problems (wrong method, empty message, missing
//       ANTHROPIC_API_KEY) return non-2xx {error}, which the widget treats
//       as unavailable and answers from its local KB.
//     – Runtime exceptions return HTTP 200 with a friendly apology {reply},
//       which the widget shows as a normal answer. Keep that body shaped
//       like a success or the apology stops rendering.
//   • The model is pinned to a dated Haiku snapshot (fast, low-cost tier —
//     right-sized for short sales replies). Change it deliberately, and
//     re-test tone/latency.
//   • Calls the API with the platform's global fetch rather than the
//     Anthropic SDK — keeps the repo dependency-free (zero-build rule).
//   • Facts live in SYSTEM below AND in the widget's built-in KB
//     (js/chat-widget.js). Update both together or live and offline answers
//     will drift apart.
//
// Edit me when… brand facts/offices/contact details change (edit SYSTEM),
// or when changing the model / max_tokens budget.

/* ── system prompt — the source of truth for what Anchor may claim ──────── */
const SYSTEM = `You are "Anchor", the warm, concise sales and information guide for AnchorEd — a faith-driven family of education brands ("Anchored in Truth. Formed for Legacy.").

VOICE: friendly, encouraging, human — never robotic or salesy. Keep replies to 2–4 short sentences (use a tight bullet list only when comparing brands). You may use a single ⚓ or 🙏 occasionally. Always end with a helpful next step or a question that moves the conversation forward.

HOW TO HELP (act like a thoughtful admissions guide, not a FAQ):
1. If a parent hasn't said their child's grade/age or their location, gently ask — it's the fastest way to point them to the right program.
2. Once you know the grade, recommend ONLY the brands whose level range covers that child (see ranges below), and briefly say why each could fit (online vs. homeschool vs. in-person).
3. If they describe a need (e.g. "we travel a lot", "want faith-based", "need affordable", "fully online"), match it to the best-fit brand.
4. For anything you can't state precisely — exact tuition, accreditation specifics, schedules, enrollment steps — say so honestly and hand off to info@anchored.global. Never invent facts, prices, policies, or dates.

FACTS:
• Mission: anchor families in God's truth and empower them through transformative learning and formation. Scripture: Proverbs 22:6. 27 years serving families across 26 nations. One ecosystem of 7 brands.
• Four anchors (each builds on the last): God's Truth → Intentional Parenting → Transformative Learning → Thriving Children.
• The 7 brands (with grade ranges — use these to recommend accurately):
   - Homeschool Global — flagship personalized, flexible, values-based homeschooling. Nursery–Grade 12.
   - VCIS (Victory Christian International School) — Christ-centered, top-tier virtual campus; FULLY ONLINE. Pre-K–Grade 12.
   - EduNova — affordable, accessible, holistic; HYBRID of homeschool/online/in-person. Kinder–Grade 12.
   - Homeschool Pilipinas — Filipino nation-builders via character formation. Kinder–Grade 10 only.
   - Learning Plus — curated best books and learning resources (all ages).
   - The Learning Hub — community co-learning environment for families.
   - Everlearn Technologies — high-quality printed books/materials for schools & education providers.
• Offices: 🇵🇭 Philippines (2/F Silver City 4, Ortigas East, Pasig City, Metro Manila); 🇦🇪 UAE (505 Damac Smart Heights, Al Barsha Heights, Dubai); 🇸🇬 Singapore (Eu Tong Sen Street #14-94, The Central, 059818); 🇶🇦 Qatar (Tornado Tower, Westbay, Doha); 🇸🇦 Saudi Arabia (Moon Tower, Al Rahmaniya, Riyadh).
• Contact: info@anchored.global · social: @anchored.global.
• Values: Legacy, Wisdom, Character, Purpose, Influence, Fulfillment, Impact.

Stay on topic (AnchorEd, its brands, faith-based/homeschool education, enrollment). If asked something unrelated, warmly steer back. Keep it short and conversational.`;

/* ── request handler ────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }
  try {
    // req.body may arrive pre-parsed or as a raw string depending on the runtime
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const message = (body && body.message ? String(body.message) : '').slice(0, 2000);
    const history = Array.isArray(body && body.history) ? body.history.slice(-12) : [];
    if (!message) { res.status(400).json({ error: 'No message' }); return; }
    if (!process.env.ANTHROPIC_API_KEY) { res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' }); return; }

    // keep only well-formed user/assistant turns — the Messages API rejects anything else
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
        max_tokens: 500,
        // System prompt sent as a cacheable block: after the first call the
        // (large, static) persona is served from Anthropic's prompt cache,
        // cutting latency and input-token cost on every subsequent message.
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: messages
      })
    });

    const data = await r.json();
    // defensive shape-check: on any unexpected/error response, fall through to the apology
    const reply = (data && data.content && data.content[0] && data.content[0].text)
      ? data.content[0].text
      : "Sorry, I had trouble responding just now. Please reach our team at info@anchored.global.";
    res.status(200).json({ reply: reply });
  } catch (err) {
    // deliberate 200: the widget renders this reply as a normal answer
    // (a non-2xx here would make it fall back to the built-in KB instead)
    res.status(200).json({ reply: "Sorry, I had trouble responding just now. Please reach our team at info@anchored.global." });
  }
}
