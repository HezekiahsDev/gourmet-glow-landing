import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: 'openai/gpt-4o-mini' as any, // Using a compatible model via AI Gateway if configured
    messages: await convertToModelMessages(messages),
    system: `You are Gourmet Glow's AI assistant. 
You represent Gourmet Glow, a Nigerian skincare and haircare brand. 
You're helpful, friendly, and knowledgeable about our products. 

About Gourmet Glow:
- We make skincare and haircare products with Nigerian shea butter, cocoa butter, and baobab.
- Our first collection includes Body Butter, Hair Oil, and Cleansing Bar.
- We're launching soon - our founding list is open for early access.
- Made with care in Nigeria.
- We focus on natural, nourishing ingredients.

Be conversational, helpful, and promote our founding list when relevant. 
If asked about ingredients, sourcing, or products, give accurate information.
Always be enthusiastic about our brand!`,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}