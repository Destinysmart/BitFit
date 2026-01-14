
export const BITFITNESS_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRjc5MzFBO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkFCNDI7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIyNTAiIGZpbGw9InVybCgjZ3JhZCkiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIvPgo8cGF0aCBkPSJNMzUwLDI4MGMwLDQ1LTM1LDgwLTgwLDgwaC05MFYxNTBoODBjNDUsMCw4MCwzNSw4MCw4MGMwLDE1LTQsMjgtMTEsMzljNyw0LDExLDEyLDExLDIxdjMwWiBNMjIwLDIzMGg0MGMyMiwwLDQwLTE4LDQwLTQwcy0xOC00MC00MC00MGgtNDBWMjMweiBNMjIwLDMyMGg1MGMyMiwwLDQwLTE4LDQwLTQwcy0xOC00MC00MC00MGgtNTBWMzIweiIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMjM1IiB5PSIxMTAiIHdpZHRoPSIxOCIgaGVpZ2h0PSI2MCIgcng9IjkiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjI4NSIgeT0iMTEwIiB3aWR0aD0iMTgiIGhlaWdodD0iNjAiIHJ4PSI5IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIyMzUiIHk9IjM0MiIgd2lkdGg9IjE4IiBoZWlnaHQ9IjYwIiByeD0iOSIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMjg1IiB5PSIzNDIiIHdpZHRoPSIxOCIgaGVpZ2h0PSI2MCIgcng9IjkiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==";

/**
 * PROTOCOL ASSET LIBRARY
 * Centralized CDN links for exercise visualization.
 */
const PROTOCOL_ASSETS = {
  pushups: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
  squats: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
  pullups: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800',
  lunges: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&q=80&w=800',
  plank: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
  burpees: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
  running: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800',
  crunches: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800'
};

export const EXERCISES = [
  'Push-ups',
  'Squats',
  'Pull-ups',
  'Lunges',
  'Plank (Seconds)',
  'Burpees',
  'Run (Minutes)',
  'Crunches'
];

export const EXERCISE_TIPS: Record<string, string> = {
  'Push-ups': "Keep your core tight and elbows at a 45-degree angle. Full range of motion.",
  'Squats': "Chest up, weight on heels. Go parallel or below for maximum recruitment.",
  'Pull-ups': "Engage your lats. Pull your chest toward the bar, not just your chin.",
  'Lunges': "Step far enough to keep your front knee behind your toes. Stay upright.",
  'Plank (Seconds)': "Maintain a straight line from head to heels. Don't let your hips sag.",
  'Burpees': "Explosive movement. Land softly on your feet during the jump.",
  'Run (Minutes)': "Maintain a steady rhythm and focus on breathing. Soft foot strikes.",
  'Crunches': "Focus on using your abs, not your neck. Small, controlled movements."
};

export const EXERCISE_VISUALS: Record<string, string> = {
  'Push-ups': PROTOCOL_ASSETS.pushups,
  'Squats': PROTOCOL_ASSETS.squats,
  'Pull-ups': PROTOCOL_ASSETS.pullups,
  'Lunges': PROTOCOL_ASSETS.lunges,
  'Plank (Seconds)': PROTOCOL_ASSETS.plank,
  'Burpees': PROTOCOL_ASSETS.burpees,
  'Run (Minutes)': PROTOCOL_ASSETS.running,
  'Crunches': PROTOCOL_ASSETS.crunches
};

export const BITCOIN_QUOTES = [
  "Don't trust your scale, verify your strength. #BitFitness",
  "Consistency is the compound interest of physical health.",
  "Stack reps like you stack sats: one at a time, with conviction.",
  "Low time preference applies to your body too. Play the long game.",
  "Your body is a fortress; keep the walls strong.",
  "Fix the money, fix the world. Fix the body, fix yourself.",
  "Proof of Work: No shortcuts, just sweat and results.",
  "Fitness is a decentralised asset; nobody can seize your gains.",
  "Be your own bank, be your own trainer.",
  "Bitcoin is sound money; movement is sound living."
];

export const INITIAL_CHALLENGES = [
  {
    id: 'ch1',
    title: 'Genesis Block Strength',
    description: 'Complete at least one workout every day for 7 days.',
    targetDays: 7,
    currentDays: 0,
    joined: false
  },
  {
    id: 'ch2',
    title: 'Satoshi\'s Squat Sprint',
    description: 'Log 500 total squats over 30 days.',
    targetDays: 30,
    currentDays: 0,
    joined: false
  },
  {
    id: 'ch3',
    title: 'BitFitness 2.0: 30-Day PoW',
    description: '30 days of consistent effort. No days off from movement.',
    targetDays: 30,
    currentDays: 0,
    joined: false
  }
];
