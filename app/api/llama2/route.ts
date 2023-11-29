import { Message, StreamingTextResponse, readableFromAsyncIterable } from "ai";
import {
  TextChatMessage,
  Llama2PromptFormat,
  ollama,
  streamText,
} from "modelfusion";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // Use ModelFusion to call Ollama:
  const textStream = await streamText(
    ollama
      .TextGenerator({
        model: "llama2:chat",
        maxCompletionTokens: -1, // infinite generation
        temperature: 0,
        raw: true, // use raw inputs and map to prompt format below
      })
      .withPromptFormat(Llama2PromptFormat.chat()), // Llama2 prompt
    {
      system:
        "You are an AI chat bot. " +
        "Follow the user's instructions carefully.",

      // map Vercel AI SDK Message to ModelFusion TextChatMessage:
      messages: messages.filter(
        // only user and assistant roles are supported:
        (message) => message.role === "user" || message.role === "assistant"
      ) as TextChatMessage[],
    }
  );

  // Return the result using the Vercel AI SDK:
  return new StreamingTextResponse(readableFromAsyncIterable(textStream));
}
