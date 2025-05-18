// For Node.js compatibility
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

// Import directly from compiled sources
const { runMindBuddy } = require('../dist/runMindBuddy');

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

  try {
    console.log('Running MindBuddy with profile:', profile);
    const reply = await runMindBuddy(profile, "", "Feeling low today tbh.");
    console.log('\nMindBuddy Response:');
    console.log(reply);
  } catch (error) {
    console.error('Error running MindBuddy:', error);
  }
})(); 