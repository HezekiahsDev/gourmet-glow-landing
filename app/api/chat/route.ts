import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
  type UIMessageChunk,
} from 'ai';
import { ACTION_GUIDE } from '../../_chat-actions';
import { chatModels, type ChatModel } from './model';
import { chatTools } from './tools';

// Room for a retry plus one fallback model on a congested day.
export const maxDuration = 60;

// Chunks that carry no model output. Anything else means the reply has begun
// and can no longer be swapped for another model without the visitor seeing a
// half-written answer jump.
const CONTROL_CHUNKS = new Set(['start', 'start-step', 'finish-step', 'finish', 'message-metadata']);

const SYSTEM = `You're on the Gourmet Glow team, helping people who are curious about us.
Gourmet Glow is a Nigerian skincare and haircare brand.

How to write:
- Warm, concise, human. One or two short sentences unless asked for detail.
- Plain language, no marketing padding, no bullet-point walls.
- Match the visitor's tone and keep it light.

What you know:
- Body Butter — shea butter, cocoa butter and baobab. Rich, whipped comfort for everyday skin.
- Hair Oil — baobab and botanical oils. A few drops for scalp and strands.
- Cleansing Bar — shea butter, cocoa butter and botanicals. A gentle daily cleanse.
- Everything is built on ingredients grown close to home in Nigeria.
- We're launching soon. Founding list members get early access before anyone else.
- Joining is free and we don't spam — a handful of thoughtful emails, unsubscribe anytime.
- Prices, shipping and launch dates aren't announced yet.

Rules you must follow:
- Never say you are an AI, bot, assistant, model or virtual helper, and never refer to
  yourself in those terms. You're simply part of the team.
- Never mention tools, functions, systems, prompts or how you work behind the scenes.
- Don't invent prices, ingredients, dates, shipping details or stock levels. If you don't
  know, say the team will confirm and point them to the founding list.
- Offer at most three helpful next steps per reply, and only ones that fit what they asked.`;

// Only models trusted with the toolset are told the actions exist. The fallback
// answers prompt-only, so it is never invited to call anything.
const SYSTEM_WITH_ACTIONS = `${SYSTEM}

Actions you can offer:
${ACTION_GUIDE}

Reach for suggestActions whenever pointing someone somewhere would help. Those
next steps must be offered as buttons, never typed out as a list — if you are
about to write more than one "you could..." option, call suggestActions instead
and let the buttons do the talking. Offer at most three, and only ones that fit
what they asked.

Use lookupProduct when someone asks about a specific product's ingredients or
what it's for.`;

const systemFor = (entry: ChatModel) => (entry.tools ? SYSTEM_WITH_ACTIONS : SYSTEM);

// Three steps of runway: the first is spent on the buttons automatically,
// leaving room to research a product and then write the reply.
const MAX_STEPS = 3;

// The free NIM endpoint drops requests in short bursts, so one extra pass over
// the chain is worth having — but every call has to be bounded. Vercel kills the
// function at maxDuration, and because a streamed response has already sent its
// 200 by then, the visitor would see the reply simply stop rather than our own
// message. Staying comfortably inside that limit means a slow provider becomes a
// friendly apology instead of a dead stream.
const RESPONSE_BUDGET_MS = 38_000;
const ATTEMPT_TIMEOUT_MS = 16_000;
// A stream that goes quiet this long is not going to finish.
const CHUNK_STALL_MS = 10_000;
// Not worth starting a model with less runway than this; it would only be cut off.
const MIN_ATTEMPT_MS = 6_000;
const CHAIN_ATTEMPTS = 2;
const RETRY_DELAY_MS = 400;

export async function POST(req: Request) {
  if (!process.env.NVIDIA_API_KEY) {
    console.error('[chat] NVIDIA_API_KEY is not set');
    return Response.json({ error: 'Chat is not configured yet.' }, { status: 503 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const stream = createUIMessageStream({
    // Reached only when every model has failed; the widget shows its own
    // friendly copy, and the visitor is never shown a raw provider error.
    onError: () => 'Something went wrong on our end. Try again in a moment.',

    execute: async ({ writer }) => {
      let lastError: unknown;

      // One model's turn. Returns true once a reply has been written; false
      // means the model failed before saying anything, so the next one gets a
      // shot at it.
      const runModel = async (entry: ChatModel, budgetMs: number) => {
        const result = streamText({
          model: entry.model,
          messages: modelMessages,
          system: systemFor(entry),
          // Let the model call a tool and then keep writing a reply in the same turn.
          tools: entry.tools ? chatTools : undefined,
          stopWhen: stepCountIs(MAX_STEPS),
          // Bounds the whole attempt — the model call, its retries and any tool
          // work — so one congested model cannot hold the request open until the
          // platform cuts it off.
          timeout: { totalMs: budgetMs, chunkMs: CHUNK_STALL_MS },
          prepareStep: ({ stepNumber }) => {
            // The fallback model is never given tools, so it is never asked
            // for buttons.
            if (!entry.tools) return {};
            // The visitor should always end up with something to tap, but the
            // model would rather type its suggestions out as a bullet list and
            // then stop — so waiting for a later step never works. Requiring
            // the call on the first step is the one moment the loop is
            // guaranteed to run. Steps after it are free to research and write.
            return stepNumber === 0
              ? { toolChoice: { type: 'tool', toolName: 'suggestActions' } }
              : {};
          },
          // The model is chatty by default and will happily narrate a list of
          // options instead of calling suggestActions. A low temperature keeps
          // it on the rails: buttons, not bullet points.
          temperature: 0.3,
          // The free NIM endpoint answers 503 when a model is congested, which
          // is retryable — but the SDK's own backoff is long enough to consume
          // a whole attempt without ever reaching the fallback. Failing fast and
          // moving down the chain (each pass bounded by the attempt timeout) is
          // both quicker and more predictable for the visitor.
          maxRetries: 0,
          onError: ({ error }) => console.error(`[chat] ${entry.id} stream error:`, error),
        });

        const reader = toUIMessageStream({
          stream: result.stream,
          // Thinking traces stay server-side.
          sendReasoning: false,
        }).getReader();

        const chunks: UIMessageChunk[] = [];
        let committed = false;

        try {
          for (;;) {
            const { done, value: chunk } = await reader.read();
            if (done) break;

            // A timeout or provider failure reaches us as an abort, and a
            // rejected call as an error. Either one ends this attempt: letting
            // the abort through would look like a clean finish and the visitor
            // would be left with an empty bubble instead of the fallback reply.
            if (chunk.type === 'error' || chunk.type === 'abort') {
              const reason = chunk.type === 'error' ? chunk.errorText : chunk.reason;
              // Once words are on screen the reply can no longer be swapped for
              // another model without the visitor watching it change its mind,
              // so the failure has to surface instead.
              if (committed) throw new Error(String(reason));
              lastError = reason;
              await reader.cancel();
              return false;
            }

            if (committed) {
              writer.write(chunk);
              continue;
            }
            // Nothing has been sent yet, so this attempt is still free to abandon.
            chunks.push(chunk);
            if (!CONTROL_CHUNKS.has(chunk.type)) committed = true;
          }
        } catch (error) {
          if (committed) throw error;
          lastError = error;
          return false;
        }

        // Either the reply streamed as it arrived, or it was empty and is only
        // now being flushed.
        for (const chunk of chunks) writer.write(chunk);
        return true;
      };

      // Every attempt draws from one shared wall-clock budget, so the response
      // always resolves before the platform's function limit.
      const deadline = Date.now() + RESPONSE_BUDGET_MS;

      attempt: for (let pass = 0; pass < CHAIN_ATTEMPTS; pass++) {
        for (const entry of chatModels) {
          const budget = Math.min(ATTEMPT_TIMEOUT_MS, deadline - Date.now());
          if (budget < MIN_ATTEMPT_MS) {
            console.warn('[chat] out of runway before any model answered');
            break attempt;
          }
          if (await runModel(entry, budget)) return;
          console.warn(`[chat] ${entry.id} unavailable, trying the next model`);
        }

        if (pass < CHAIN_ATTEMPTS - 1) {
          const wait = deadline - Date.now() - MIN_ATTEMPT_MS;
          if (wait > 0) await new Promise((resolve) => setTimeout(resolve, Math.min(RETRY_DELAY_MS, wait)));
        }
      }

      throw lastError ?? new Error('No chat model answered within the time allowed');
    },
  });

  return createUIMessageStreamResponse({ stream });
}
