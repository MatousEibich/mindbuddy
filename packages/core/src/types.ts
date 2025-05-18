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

/** leave in place for a later safety phase */
export const CRISIS_HANDOFF = "{{CRISIS_HANDOFF}}"; 