import { PromptTemplate } from "@langchain/core/prompts";
import { Profile, CRISIS_HANDOFF } from "./types";
import { MINDBUDDY_TEMPLATE, STYLE_INSTRUCTIONS } from "./prompt";

const tmpl = PromptTemplate.fromTemplate(MINDBUDDY_TEMPLATE);

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