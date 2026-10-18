export interface Archetype {
  name: string;
  line: string;
}

// Keyed by reduced Life Path number (1-9, plus master numbers 11, 22, 33).
export const ARCHETYPES: Record<number, Archetype> = {
  1: { name: "The Founder", line: "Builds first, asks permission never." },
  2: { name: "The Broker", line: "Wins through alliances others don't see coming." },
  3: { name: "The Storyteller", line: "Turns a pitch deck into a movement." },
  4: { name: "The Architect", line: "Builds the thing that outlasts the trend." },
  5: { name: "The Operator", line: "Moves fast across markets and never gets stuck." },
  6: { name: "The Steward", line: "Grows wealth that takes care of people." },
  7: { name: "The Strategist", line: "Sees three moves ahead of the market." },
  8: { name: "The Executive", line: "Built for scale, boardrooms, and leverage." },
  9: { name: "The Visionary", line: "Plays a longer game than the quarter." },
  11: { name: "The Catalyst", line: "One conversation from you changes a room." },
  22: { name: "The Master Builder", line: "Turns abstract vision into standing infrastructure." },
  33: { name: "The Lord of Wealth", line: "Rare. Built to steward outsized abundance." },
};

export function getArchetype(lifePathNumber: number): Archetype {
  return ARCHETYPES[lifePathNumber] ?? ARCHETYPES[1];
}

