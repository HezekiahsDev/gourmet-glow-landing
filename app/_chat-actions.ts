// Shared between the chat API route (which may suggest actions) and the chat
// UI (which performs them). Keep this list in one place so a suggested action
// can never point at a handler the UI does not know about.
//
// Every action here does something real on the landing page. There is no
// "view cart" action because the site has no cart or checkout yet — inventing
// one would give visitors a button that goes nowhere.

export type ChatActionId =
  | 'view_collection'
  | 'notify_product'
  | 'find_ritual'
  | 'join_list'
  | 'see_ingredients'
  | 'read_faqs'
  | 'message_whatsapp';

export type ChatAction =
  | { id: Exclude<ChatActionId, 'notify_product'>; label: string; hint?: string }
  | { id: 'notify_product'; label: string; hint?: string; product: string };

// Descriptions handed to the model so it knows when each action is useful.
export const ACTION_GUIDE = `- view_collection: show the three products (Body Butter, Hair Oil, Cleansing Bar)
- notify_product: let them ask to be told about one specific product. Requires "product" set to one of: Body Butter, Hair Oil, Cleansing Bar
- find_ritual: help them pick a starting product by answering two quick questions
- join_list: join the founding list for early access
- see_ingredients: explain shea butter, cocoa butter and baobab
- read_faqs: answer launch timing, what's in the collection, sourcing, emails
- message_whatsapp: talk to the team directly on WhatsApp`;

export const KNOWN_PRODUCTS = ['Body Butter', 'Hair Oil', 'Cleansing Bar'] as const;

export function isChatActionId(value: unknown): value is ChatActionId {
  return typeof value === 'string' && value in DEFAULT_LABELS;
}

export const DEFAULT_LABELS: Record<ChatActionId, string> = {
  view_collection: 'Browse the collection',
  notify_product: 'Tell me when it launches',
  find_ritual: 'Find my ritual',
  join_list: 'Join the founding list',
  see_ingredients: 'See our ingredients',
  read_faqs: 'Common questions',
  message_whatsapp: 'Message us on WhatsApp',
};

// ---- Reading tool output out of a streamed message -------------------------

// Minimal shape of a UI message part we care about; tool parts arrive as
// `tool-<name>` and only carry output once state is 'output-available'.
type PartLike = { type?: string; state?: string; output?: unknown };

export function actionsFromParts(parts: readonly PartLike[]): ChatAction[] {
  return parts.flatMap((part) => {
    if (part.type !== 'tool-suggestActions' || part.state !== 'output-available') return [];
    const out = part.output as { actions?: ChatAction[] } | undefined;
    if (!Array.isArray(out?.actions)) return [];
    // Trust nothing: drop anything not in the known registry.
    return out.actions.filter((a) => a && typeof a.id === 'string' && isChatActionId(a.id));
  });
}

export type ProductFacts = {
  found: true;
  name: string;
  line: string;
  tagline: string;
  ingredients: string[];
};

export function productFromParts(parts: readonly PartLike[]): ProductFacts | null {
  for (const part of parts) {
    if (part.type !== 'tool-lookupProduct' || part.state !== 'output-available') continue;
    const out = part.output as Partial<ProductFacts> & { found?: boolean } | undefined;
    if (out?.found && typeof out.name === 'string') return out as ProductFacts;
  }
  return null;
}
