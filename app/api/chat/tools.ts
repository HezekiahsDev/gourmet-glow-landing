import { jsonSchema, tool } from 'ai';
import { products as catalog } from '../../_data';
import { DEFAULT_LABELS, isChatActionId, KNOWN_PRODUCTS } from '../../_chat-actions';

// Only the fields the chat needs — keeps tool output small and stops internal
// shape leaking into the model's context.
const productFacts = catalog.map((p) => ({
  name: p.name,
  line: p.line,
  tagline: p.tagline,
  ingredients: p.ingredients,
}));

// The model drifts on how it names these. Asked for `["join_list"]` it will
// sometimes send `[{ "action": "join_list" }]` instead — especially when the
// call is forced. Since the input schema is plain JSON Schema and is not
// validated at runtime, entries arrive exactly as written, so accept every
// shape we've seen rather than silently dropping the button.
function collectIds(actions: unknown): string[] {
  const list = Array.isArray(actions) ? actions : [actions];
  return list.flatMap((entry) => {
    if (typeof entry === 'string') return [entry];
    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>;
      const value = record.action ?? record.id ?? record.name ?? record.value;
      return typeof value === 'string' ? [value] : [];
    }
    return [];
  });
}

export const lookupProduct = tool({
  description:
    'Look up real details for one Gourmet Glow product. Use whenever someone asks about a specific product.',
  inputSchema: jsonSchema<{ product: string }>({
    type: 'object',
    properties: {
      product: {
        type: 'string',
        enum: [...KNOWN_PRODUCTS],
        description: 'The product to look up.',
      },
    },
    required: ['product'],
    additionalProperties: false,
  }),
  execute: async ({ product }) => {
    const match = productFacts.find((p) => p.name.toLowerCase() === product.toLowerCase());
    if (!match) return { found: false as const, available: [...KNOWN_PRODUCTS] };
    return { found: true as const, ...match };
  },
});

export const suggestActions = tool({
  description:
    'Offer tappable next steps to the visitor. Only include actions that clearly help with what they just asked.',
  inputSchema: jsonSchema<{ actions: (string | { action?: string })[]; product?: string }>({
    type: 'object',
    properties: {
      actions: {
        type: 'array',
        items: {
          type: 'string',
          enum: [
            'view_collection',
            'notify_product',
            'find_ritual',
            'join_list',
            'see_ingredients',
            'read_faqs',
            'message_whatsapp',
          ],
        },
        minItems: 1,
        maxItems: 3,
      },
      product: {
        type: 'string',
        enum: [...KNOWN_PRODUCTS],
        description: 'Only for notify_product: which product they want a launch alert for.',
      },
    },
    required: ['actions'],
    additionalProperties: false,
  }),
  // Rebuilds the buttons server-side from the shared registry, so a malformed
  // or unknown id from the model can never reach the UI as a dead button.
  execute: async ({ actions, product }) => {
    const deduped = [...new Set(collectIds(actions))].filter(isChatActionId).slice(0, 3);
    const knownProduct =
      product && (KNOWN_PRODUCTS as readonly string[]).includes(product) ? product : undefined;

    return {
      actions: deduped.map((id) => ({
        id,
        label: DEFAULT_LABELS[id],
        ...(id === 'notify_product' ? { product: knownProduct ?? KNOWN_PRODUCTS[0] } : {}),
      })),
    };
  },
});

export const chatTools = { lookupProduct, suggestActions };
