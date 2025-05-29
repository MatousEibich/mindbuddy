// Simple profile demo showing the personalized greeting
import { Profile } from "../dist/types";

// Sample profile matching the default in apps/web/public/profile.json
const profile: Profile = {
  name: "Matouš",
  pronouns: "he/him",
  style: "neil",
  core_facts: [
    { id: 1, text: "I'm currently doing a mesocycle with calisthenics." },
    { id: 2, text: "I've got a dog named Rosie, she's the best." },
  ],
};

// Format a greeting with the profile name - same as used in the web app
function formatGreeting(profile: Profile): string {
  return `Hey ${profile.name}, I'm here for you! What's on your mind?`;
}

// Main demo
function main() {
  console.log("\nMindBuddy Greeting Demo\n---------------------");
  console.log(formatGreeting(profile));
  console.log(`\nProfile details:`);
  console.log(`- Name: ${profile.name}`);
  console.log(`- Style: ${profile.style}`);
  console.log(`- Pronouns: ${profile.pronouns}`);
  console.log(`- Facts: ${profile.core_facts.length}`);
}

// Run the demo
main(); 