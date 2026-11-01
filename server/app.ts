import express from 'express';
import type { DecisionId, UserProfile } from '../src/types.ts';
import { TUTOR_PROMPT_VERSION } from './geminiTutorPrompt.ts';

export interface TutorInput { decisionId: DecisionId; profile: UserProfile; thought: string }
export type TutorGenerator = (input: TutorInput, signal: AbortSignal) => Promise<string>;
export interface AppOptions { generateReply: TutorGenerator | null; model: string; timeoutMs?: number }
export const TUTOR_ERROR = 'Öğretmene ulaşılamadı. Tekrar deneyebilir veya kararına devam edebilirsin.';

export function createApp({ generateReply, model, timeoutMs = 15000 }: AppOptions) {
  const app = express();
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', hasApiKey: Boolean(generateReply), model, promptVersion: TUTOR_PROMPT_VERSION }));
  app.post('/api/tutor', async (req, res) => {
    const controller = new AbortController();
    let timedOut = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let rejectOnAbort: (() => void) | undefined;
    const onClose = () => { if (!res.writableEnded) controller.abort(); };
    res.once('close', onClose);
    try {
      const { decisionId, profile, thought } = req.body ?? {};
      if (!decisionId || ![1, 2, 3].includes(decisionId)) return void res.status(400).json({ error: 'Geçersiz sahne numarası.' });
      if (!profile || typeof profile !== 'object' || Array.isArray(profile)
        || !['beginner', 'experienced'].includes(profile.level)
        || !['developer', 'tester'].includes(profile.role)
        || !['architecture', 'testing', 'security'].includes(profile.goal)) {
        return void res.status(400).json({ error: 'Eksik veya geçersiz profil bilgisi.' });
      }
      const clean = typeof thought === 'string' ? thought.trim() : '';
      if (!clean || clean.length > 2000) return void res.status(400).json({ error: 'Geçersiz düşünce metni.' });
      if (!generateReply) return void res.status(503).json({ error: TUTOR_ERROR });
      const interrupted = new Promise<never>((_resolve, reject) => {
        rejectOnAbort = () => reject(controller.signal.reason);
        controller.signal.addEventListener('abort', rejectOnAbort, { once: true });
      });
      timer = setTimeout(() => { timedOut = true; controller.abort(new Error('Tutor deadline')); }, timeoutMs);
      const reply = await Promise.race([
        generateReply({ decisionId, profile, thought: clean }, controller.signal),
        interrupted,
      ]);
      if (res.destroyed) return;
      if (!reply.trim()) return void res.status(502).json({ error: TUTOR_ERROR });
      res.json({ tutorResponse: reply.trim() });
    } catch {
      if (!res.destroyed) res.status(timedOut ? 504 : 502).json({ error: TUTOR_ERROR });
    } finally {
      clearTimeout(timer);
      if (rejectOnAbort) controller.signal.removeEventListener('abort', rejectOnAbort);
      res.off('close', onClose);
    }
  });
  app.use((error: { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(error.status === 413 ? 413 : 400).json({ error: 'Geçersiz istek gövdesi.' });
  });
  return app;
}
