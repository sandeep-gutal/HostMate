export type LibraryActivity = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  tags: string[];
};

export const ACTIVITIES_LIBRARY: LibraryActivity[] = [
  {
    id: "two-truths",
    title: "Two Truths and a Lie",
    tags: ["icebreaker", "all-ages"],
    duration_minutes: 8,
    description:
      "Each volunteer shares two true facts and one lie. The room votes. Host gives a silly example first so nobody overshares.",
  },
  {
    id: "speed-intros",
    title: "15-Second Intros",
    tags: ["icebreaker"],
    duration_minutes: 6,
    description:
      "Name, where you live/work, one fun fact. Timer is visible and ruthless. Great when guests don't know each other.",
  },
  {
    id: "human-bingo",
    title: "Human Bingo",
    tags: ["mixer", "corporate"],
    duration_minutes: 12,
    description:
      "A grid of prompts ('has a pet', 'has lived in another city'). First complete line wins. People must talk, not shout.",
  },
  {
    id: "charades",
    title: "Festival / Film Charades",
    tags: ["game", "fun"],
    duration_minutes: 10,
    description:
      "Act out film titles, festival rituals, or famous lines. No speaking. Keep rounds to 45 seconds.",
  },
  {
    id: "pass-the-mic-joke",
    title: "One-Line Joke Relay",
    tags: ["jokes", "fun"],
    duration_minutes: 6,
    description:
      "Each person may tell one clean one-liner or pass. Groans count as applause. Host has two backup jokes ready.",
  },
  {
    id: "backup-joke-lifts",
    title: "Backup joke: The Society Lift",
    tags: ["jokes"],
    duration_minutes: 1,
    description:
      "Our lift has three speeds: slow, slower, and 'someone is holding it for a sofa'. If it ever arrives empty, that is not a miracle — that is a scheduling error.",
  },
  {
    id: "backup-joke-groupchat",
    title: "Backup joke: The Group Chat",
    tags: ["jokes"],
    duration_minutes: 1,
    description:
      "Our building group chat has two kinds of messages: 'Happy Diwali' and 47 photos of a leaking pipe. Both are a form of worship.",
  },
  {
    id: "musical-statues",
    title: "Freeze Dance / Musical Statues",
    tags: ["kids", "game"],
    duration_minutes: 5,
    description:
      "Dance on music, freeze on silence. Last mover is out — or restart if the crowd is young.",
  },
  {
    id: "guess-the-resident",
    title: "Guess the Guest",
    tags: ["icebreaker"],
    duration_minutes: 8,
    description:
      "Read a fun fact from RSVPs (with permission). Audience guesses who it is. Instant intro material for the host.",
  },
  {
    id: "desert-island",
    title: "Desert Island Skill",
    tags: ["corporate", "mixer"],
    duration_minutes: 8,
    description:
      "Pairs: what non-work skill would you bring to a desert island? 90 seconds each, then rotate once.",
  },
  {
    id: "balloon-keepup",
    title: "Balloon Keep-Up",
    tags: ["kids", "game"],
    duration_minutes: 4,
    description:
      "Don't let the balloon hit the floor. Add a second balloon when it gets easy. Outdoor or high-ceiling indoor.",
  },
  {
    id: "appreciation",
    title: "Appreciation in One Sentence",
    tags: ["formal", "closing"],
    duration_minutes: 6,
    description:
      "Volunteers only: 'I want to thank ___ for ___.' Specific, short, optional. Never force it.",
  },
];
