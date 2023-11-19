import { Message, StreamingTextResponse, readableFromAsyncIterable } from "ai";
import {
  ChatMessage,
  OllamaTextGenerationModel,
  TextPromptFormat,
  streamText,
} from "modelfusion";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // Use ModelFusion to call Ollama:
  const textStream = await streamText(
    new OllamaTextGenerationModel({
      model: "mistral:7b-text",
      maxCompletionTokens: -1, // infinite generation
      temperature: 0,
      raw: true, // use raw inputs and map to prompt format below
    }).withPromptFormat(TextPromptFormat.chat()), // Plain text prompt
    {
      system:
        "You are an AI chat bot. " +
        "Follow the user's instructions carefully.",

      // map Vercel AI SDK Message to ModelFusion ChatMessage:
      messages: messages.filter(
        // only user and assistant roles are supported:
        (message) => message.role === "user" || message.role === "assistant"
      ) as ChatMessage[],
    }
  );

  // Return the result using the Vercel AI SDK:
  return new StreamingTextResponse(readableFromAsyncIterable(textStream));
}
