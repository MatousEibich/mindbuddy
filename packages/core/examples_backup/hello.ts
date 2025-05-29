const { runMindBuddy } = require("../dist/runMindBuddy");
const { Profile } = require("../dist/types");

(async () => {
  const profile = {
    name: "Matouš",
    pronouns: "he/him",
    style: "neil",
    core_facts: [
      { id: 1, text: "I'm currently doing a mesocycle with calisthenics." },
      { id: 2, text: "I've got a dog named Rosie, she's the best." },
    ],
  };

  const reply = await runMindBuddy(profile, "", "Feeling low today tbh.");
  console.log(reply);
})(); 