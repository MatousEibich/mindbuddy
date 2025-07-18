export interface CoreFact { 
  id: number; 
  text: string;
}

export interface Profile {
  name: string;
  pronouns: string;
  style: "mom" | "middle" | "neil";
  core_facts: CoreFact[];
}

export interface Thread {
  id: string;          // uuid
  name: string;        // user-visible label
  created: number;     // ms epoch
}

/** leave in place for a later safety phase */
export const CRISIS_HANDOFF = "{{CRISIS_HANDOFF}}"; 