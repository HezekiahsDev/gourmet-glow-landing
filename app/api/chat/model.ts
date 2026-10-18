import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModel } from 'ai';

// NVIDIA NIM speaks the OpenAI chat-completions dialect, so the generic
// OpenAI-compatible provider drives it without a bespoke integration.
//
// The key lives only in the environment (NVIDIA_API_KEY) — never inline it.
const nvidia = createOpenAICompatible({
  name: 'nvidia',
  baseURL: process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY,
  // Several Nemotron models run a hidden "thinking" pass before answering. On a
  // short reply budget that reasoning can swallow the entire response and the
  // visitor is left with an empty bubble. Disabling it keeps replies visible and
  // quick; models without the feature simply ignore the field.
  transformRequestBody: (args) => ({
    ...args,
    chat_template_kwargs: { enable_thinking: false },
  }),
});

export type ChatModel = {
  id: string;
  model: LanguageModel;
  /**
   * Whether this model is trusted with the toolset. The fallback is a strong
   * writer but refuses tools out loud ("I don't have access to a function"),
   * which would expose the machinery, so it runs prompt-only.
   */
  tools: boolean;
};

/**
 * Models are tried in order.
 *
 * Worth knowing before editing this list: the public NIM endpoint advertises
 * ~80 models but this key is only provisioned for a handful — the rest answer
 * 404 "Function not found for account". Of the enabled ones, most fail one of
 * the requirements this widget has: streaming, calling tools, writing an actual
 * reply afterwards, or simply staying in character. Verified dead ends here:
 *   nvidia/nemotron-3-ultra-550b-a55b  the account default; 503/500 constantly
 *   meta/llama-3.2-90b-vision-instruct streams an empty body
 *   meta/llama-3.2-11b-vision-instruct calls tools, then never writes the reply
 *   nvidia/ising-calibration-1.5-31b   introduces itself as an NVIDIA model
 *   stepfun-ai/step-5-preview           leaks its reasoning into the reply
 *   z-ai/glm-5.3-flash                  ignores the thinking switch below
 *   google/gemma-3-12b-it              listed, but not enabled for this key
 *
 * Both entries below were verified end to end: reachable, streaming, on-brand.
 */
export const chatModels: ChatModel[] = [
  {
    id: process.env.NVIDIA_MODEL ?? 'nvidia/nemotron-3-super-120b-a12b',
    tools: true,
  },
  {
    id: process.env.NVIDIA_FALLBACK_MODEL ?? 'google/diffusiongemma-26b-a4b-it',
    tools: false,
  },
]
  .filter((entry) => Boolean(entry.id))
  .map((entry) => ({ ...entry, model: nvidia(entry.id) }));
