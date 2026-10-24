import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper paths
const LEADS_FILE = path.join(__dirname, 'leads.json');
const TEMPLATES_FILE = path.join(__dirname, 'templates.json');
const HISTORY_FILE = path.join(__dirname, 'history.json');
const BUILDS_DIR = path.join(__dirname, 'builds');

// Initialize Gemini SDK with User-Agent per guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function safeReadJson<T>(filepath: string, fallback: T): T {
  try {
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading JSON from ${filepath}:`, err);
  }
  return fallback;
}

function safeWriteJson<T>(filepath: string, data: T): void {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing JSON to ${filepath}:`, err);
  }
}

// 1. GET /api/state - Return all state data
app.get('/api/state', (req: Request, res: Response) => {
  const leads = safeReadJson(LEADS_FILE, []);
  const templates = safeReadJson(TEMPLATES_FILE, []);
  const history = safeReadJson(HISTORY_FILE, []);

  // List builds
  let buildDirs: string[] = [];
  try {
    if (fs.existsSync(BUILDS_DIR)) {
      buildDirs = fs.readdirSync(BUILDS_DIR).filter((f) => {
        return fs.statSync(path.join(BUILDS_DIR, f)).isDirectory();
      });
    }
  } catch (err) {
    console.error('Error reading builds dir:', err);
  }

  res.json({
    leads,
    templates,
    history,
    buildDirs,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasTelegramToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    hasTelegramChat: Boolean(process.env.TELEGRAM_CHAT_ID),
  });
});

// 2. GET /api/builds/:leadId - Read all files for a specific build
app.get('/api/builds/:leadId', (req: Request, res: Response) => {
  const leadId = req.params.leadId.replace(/[^a-zA-Z0-9_-]/g, '');
  const targetDir = path.join(BUILDS_DIR, leadId);

  if (!fs.existsSync(targetDir)) {
    return res.status(404).json({ error: 'Build directory not found' });
  }

  const files: Record<string, string> = {};

  function readRecursively(dir: string, relativePrefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        readRecursively(fullPath, relPath);
      } else {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          files[relPath] = content;
        } catch {
          files[relPath] = '[Binary or unreadable file]';
        }
      }
    }
  }

  readRecursively(targetDir);
  res.json({ leadId, files, fileCount: Object.keys(files).length });
});

// 3. POST /api/pipeline/run - Execute Foxy 5-step pipeline
app.post('/api/pipeline/run', async (req: Request, res: Response) => {
  const { rawBrief, clientName, customLeadId } = req.body;

  if (!rawBrief || typeof rawBrief !== 'string') {
    return res.status(400).json({ error: 'Client brief is required' });
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const leadId = customLeadId || `lead-${dateStr}`;

  try {
    // STEP 1: INTAKE (Gemini API with fallback)
    let spec: {
      client_ref?: string;
      type: 'chatbot' | 'app';
      features: string[];
      platform: string[];
      constraints: string[];
    } = {
      client_ref: clientName || 'Client Lead',
      type: 'app',
      features: [],
      platform: ['web'],
      constraints: ['standard delivery'],
    };

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Analyze this freelance client requirement and extract a strictly formatted JSON spec.
Schema:
{
  "client_ref": "Extracted client or project name",
  "type": "chatbot" or "app",
  "features": ["concrete", "feature", "list"],
  "platform": ["web", "mobile", "telegram", "node", "python"],
  "constraints": ["budget/speed/hosting/server constraints"]
}
Rules:
- "type" MUST be strictly either "chatbot" or "app".
- Output valid JSON only.

Client brief:
"""${rawBrief}"""`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          spec = {
            client_ref: clientName || parsed.client_ref || 'Client Lead',
            type: parsed.type === 'chatbot' ? 'chatbot' : 'app',
            features: Array.isArray(parsed.features) ? parsed.features : ['core-feature'],
            platform: Array.isArray(parsed.platform) ? parsed.platform : ['web'],
            constraints: Array.isArray(parsed.constraints) ? parsed.constraints : ['standard'],
          };
        }
      } catch (geminiErr) {
        console.warn('Gemini extraction error, using fallback:', geminiErr);
      }
    }

    // If still empty features, run deterministic text analysis
    if (!spec.features.length) {
      const lower = rawBrief.toLowerCase();
      const isBot = /chat|bot|assistant|faq|telegram|support/.test(lower);
      spec.type = isBot ? 'chatbot' : 'app';
      if (/telegram/.test(lower)) spec.platform = ['telegram', 'python'];
      else if (/react|web|site/.test(lower)) spec.platform = ['web', 'react'];
      else spec.platform = ['web'];

      const keywords = ['faq', 'support', 'booking', 'portfolio', 'payment', 'scraper', 'crypto', 'dark mode', 'seo'];
      spec.features = keywords.filter((k) => lower.includes(k));
      if (!spec.features.length) spec.features = ['custom freelance feature'];
      spec.constraints = ['within free tier limits'];
    }

    // STEP 2: TEMPLATE MATCH (Deterministic keyword matching against templates.json)
    const templates = safeReadJson<any[]>(TEMPLATES_FILE, []);
    let bestMatch: any = null;
    let bestScore = 0;
    let matchedKeywords: string[] = [];

    const searchTokens = new Set<string>();
    [...spec.features, ...spec.constraints, ...spec.platform].forEach((item) => {
      item
        .toLowerCase()
        .replace(/[-_]/g, ' ')
        .split(' ')
        .forEach((w) => {
          const clean = w.replace(/[^a-z0-9]/g, '');
          if (clean.length > 2) searchTokens.add(clean);
        });
    });

    for (const tmpl of templates) {
      if (tmpl.type !== spec.type) continue; // Hard filter: type must align

      const hits: string[] = [];
      const tmplPlatforms = new Set((tmpl.platforms || []).map((p: string) => p.toLowerCase()));
      const platOverlap = spec.platform.filter((p) => tmplPlatforms.has(p.toLowerCase()));
      hits.push(...platOverlap);

      const tmplKeywords = (tmpl.keywords || []).map((k: string) => k.toLowerCase());
      for (const token of searchTokens) {
        for (const kw of tmplKeywords) {
          if (token.includes(kw) || kw.includes(token)) {
            hits.push(kw);
            break;
          }
        }
      }

      const uniqueHits = Array.from(new Set(hits));
      const score = Math.min(Number((uniqueHits.length * 0.18 + platOverlap.length * 0.2).toFixed(2)), 1.0);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = tmpl;
        matchedKeywords = uniqueHits;
      }
    }

    const MATCH_THRESHOLD = 0.35;
    const isMatched = bestMatch && bestScore >= MATCH_THRESHOLD;

    const matchResult = {
      status: isMatched ? 'matched' : 'needs_custom_build',
      template_id: isMatched ? bestMatch.id : null,
      template_name: isMatched ? bestMatch.name : null,
      confidence: bestScore,
      matched_keywords: matchedKeywords,
      reason: isMatched
        ? `Deterministic match on [${matchedKeywords.join(', ')}] with score ${bestScore}`
        : `No matching starter template exceeded threshold (${MATCH_THRESHOLD}). Top score was ${bestScore}.`,
    };

    // STEP 3: BUILD (Scaffold into builds/<lead-id>/)
    const targetBuildDir = path.join(BUILDS_DIR, leadId);
    fs.mkdirSync(targetBuildDir, { recursive: true });
    const createdFiles: string[] = [];
    const clientRef = clientName || spec.client_ref || 'Client Lead';

    if (isMatched && bestMatch.starter_files) {
      const tokens: Record<string, string> = {
        '{{CLIENT_NAME}}': clientRef,
        '{{LEAD_ID}}': leadId,
        '{{BOT_ROLE}}': `Specialized Assistant for ${clientRef}`,
        '{{CLIENT_TAGLINE}}': `Automated solution for ${clientRef}`,
        '{{TEMPLATE_ID}}': bestMatch.id,
      };

      for (const [filename, rawTemplate] of Object.entries(bestMatch.starter_files as Record<string, string>)) {
        let content = rawTemplate;
        for (const [k, v] of Object.entries(tokens)) {
          content = content.replaceAll(k, v);
        }
        fs.writeFileSync(path.join(targetBuildDir, filename), content, 'utf-8');
        createdFiles.push(filename);
      }

      const manifest = {
        lead_id: leadId,
        client: clientRef,
        template_id: bestMatch.id,
        mode: 'matched_template',
        features: spec.features,
        files: createdFiles,
        timestamp: new Date().toISOString(),
      };
      fs.writeFileSync(path.join(targetBuildDir, 'foxy_manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
      createdFiles.push('foxy_manifest.json');
    } else {
      // Custom Skeleton
      const skeletonReadme = `# ${clientRef} — Custom Build Architecture\nStatus: NEEDS CUSTOM BUILD\nLead ID: ${leadId}\n\n## Requirements\n${spec.features.map((f) => `- ${f}`).join('\n')}\n\n## Platforms\n${spec.platform.join(', ')}\n\nGenerated by Foxy. Teja review required before delivery.`;
      fs.writeFileSync(path.join(targetBuildDir, 'README.md'), skeletonReadme, 'utf-8');
      createdFiles.push('README.md');

      const customSpec = {
        lead_id: leadId,
        client: clientRef,
        spec,
        mode: 'custom_skeleton',
        status: 'awaiting_teja_engineering',
      };
      fs.writeFileSync(path.join(targetBuildDir, 'custom_spec.json'), JSON.stringify(customSpec, null, 2), 'utf-8');
      createdFiles.push('custom_spec.json');

      const srcDir = path.join(targetBuildDir, 'src');
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, 'index.py'), `"""\nCustom logic entry point for ${clientRef}\n"""\ndef main():\n    print("Ready for custom dev")\n`, 'utf-8');
      createdFiles.push('src/index.py');
    }

    const buildSummary = {
      mode: isMatched ? 'matched_template' : 'skeleton_only',
      template_id: isMatched ? bestMatch.id : null,
      files_created: createdFiles.length,
      file_list: createdFiles,
      build_path: `builds/${leadId}/`,
    };

    // STEP 4: REPORT (Update leads.json, history.json, format Telegram message)
    const reviewLink = `${process.env.APP_URL || 'http://localhost:3000'}#lead-${leadId}`;
    const telegramMessage = `🦊 *FOXY FREELANCE-OPS REPORT*
*Sub-Agent under Vyshu*

📋 *Lead ID:* \`${leadId}\`
👤 *Client:* ${clientRef}
⚙️ *Pipeline Mode:* ${isMatched ? 'MATCHED TEMPLATE' : 'CUSTOM SKELETON'}
📦 *Template Used:* \`${matchResult.template_id || 'custom'}\`
📁 *Review Path:* \`builds/${leadId}/\`
🔗 *Review Link:* ${reviewLink}

📝 *Teja Approval Gate:*
[  ] PASS — Approved for manual client platform delivery
[  ] FAIL — Needs revisions / custom rework

🛑 *STOP:* Foxy has halted automation. No automatic client submission is permitted. Complete manual review before delivery.`;

    let telegramDispatched = false;
    let telegramError: string | null = null;

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'Markdown',
          }),
        });
        const tgData = await tgRes.json();
        telegramDispatched = tgData.ok === true;
        if (!telegramDispatched) telegramError = tgData.description;
      } catch (err: any) {
        telegramError = err?.message || 'Telegram network error';
      }
    }

    const newLead = {
      id: leadId,
      timestamp: new Date().toISOString(),
      client_ref: clientRef,
      raw_brief: rawBrief,
      spec,
      match: matchResult,
      build_path: `builds/${leadId}/`,
      build_summary: buildSummary,
      review: {
        status: 'pending',
        notes: 'Awaiting Teja review before manual client platform submission.',
        approved_by: null,
        timestamp: null,
      },
    };

    const leads = safeReadJson<any[]>(LEADS_FILE, []);
    leads.unshift(newLead);
    safeWriteJson(LEADS_FILE, leads);

    const history = safeReadJson<any[]>(HISTORY_FILE, []);
    history.unshift({
      id: `run-${dateStr}`,
      timestamp: new Date().toISOString(),
      lead_id: leadId,
      action: 'pipeline_execution',
      pipeline_steps: {
        intake: 'success',
        match: `${matchResult.status} (${matchResult.template_id || 'custom'})`,
        build: `${createdFiles.length} files in builds/${leadId}/`,
        report: 'telegram_notified_teja',
        stop: 'halted_for_human_review',
      },
      operator: 'foxy-agent (vyshu sub-agent)',
    });
    safeWriteJson(HISTORY_FILE, history);

    // STEP 5: STOP - Return pipeline result safely
    return res.json({
      success: true,
      lead_id: leadId,
      client: clientRef,
      spec,
      match: matchResult,
      build: buildSummary,
      telegram: {
        dispatched: telegramDispatched,
        error: telegramError,
        formatted_message: telegramMessage,
      },
      halted_for_review: true,
    });
  } catch (err: any) {
    console.error('Pipeline error:', err);
    return res.status(500).json({ error: err?.message || 'Pipeline execution failed' });
  }
});

// 4. POST /api/leads/review - Teja marks approval or adds notes
app.post('/api/leads/review', (req: Request, res: Response) => {
  const { leadId, status, notes, reviewerName } = req.body;
  if (!leadId || !status) {
    return res.status(400).json({ error: 'leadId and status are required' });
  }

  const leads = safeReadJson<any[]>(LEADS_FILE, []);
  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  lead.review = {
    status, // "approved" | "rejected" | "pending" | "needs_rework"
    notes: notes || lead.review?.notes || '',
    approved_by: reviewerName || 'Teja (Human Operator)',
    timestamp: new Date().toISOString(),
  };

  safeWriteJson(LEADS_FILE, leads);

  // Log in history
  const history = safeReadJson<any[]>(HISTORY_FILE, []);
  history.unshift({
    id: `review-${Date.now()}`,
    timestamp: new Date().toISOString(),
    lead_id: leadId,
    action: `human_review_${status}`,
    operator: reviewerName || 'Teja',
    notes: notes || '',
  });
  safeWriteJson(HISTORY_FILE, history);

  res.json({ success: true, lead });
});

// 5. POST /api/telegram/test - Test live Telegram message
app.post('/api/telegram/test', async (req: Request, res: Response) => {
  const { botToken, chatId, message } = req.body;
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return res.status(400).json({
      error: 'Missing Telegram Bot Token or Chat ID. Set in environment or pass in test modal.',
    });
  }

  const textToSend = message || `🦊 *Foxy Test Ping*\nOperational test from Vyshu sub-agent console.\nStatus: Ready for freelance ops.`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: textToSend,
        parse_mode: 'Markdown',
      }),
    });
    const tgData = await tgRes.json();
    res.json(tgData);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Telegram test ping failed' });
  }
});

// 6. POST /api/templates/update - Update templates.json
app.post('/api/templates/update', (req: Request, res: Response) => {
  const { templates } = req.body;
  if (!Array.isArray(templates)) {
    return res.status(400).json({ error: 'Templates array required' });
  }
  safeWriteJson(TEMPLATES_FILE, templates);
  res.json({ success: true, count: templates.length });
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🦊 Foxy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
