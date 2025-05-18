import { PromptTemplate } from "@langchain/core/prompts";
import { Profile, CRISIS_HANDOFF } from "./types";
import { MINDBUDDY_TEMPLATE, STYLE_INSTRUCTIONS } from "./prompt";
import { Message } from "./message";

const tmpl = PromptTemplate.fromTemplate(MINDBUDDY_TEMPLATE);

export function stringifyHistory(messages: Message[], profile?: Profile): string {
  return messages
    .map(m => `${m.role === "user" ? profile?.name || "User" : "MindBuddy"}: ${m.content}`)
    .join("\n");
}

export function renderPrompt(
  profile: Profile,
  chatHistory: string,
  query: string
) {
  return tmpl.format({
    ...profile,
    style_instructions: STYLE_INSTRUCTIONS[profile.style],
    core_facts: profile.core_facts.map((f) => f.text).join("\n"),
    chat_history: chatHistory,
    query_str: query,
    CRISIS_HANDOFF,
  });
} 