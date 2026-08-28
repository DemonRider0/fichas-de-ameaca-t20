import { EXAMPLE_THREAT_ID, type ThreatSheet } from "./threat";

export function shouldCreateExampleThreat(initialized: boolean, threatCount: number): boolean {
  return !initialized && threatCount === 0;
}

export function excludeAutomaticExample(threats: ThreatSheet[]): ThreatSheet[] {
  return threats.filter((threat) => threat.id !== EXAMPLE_THREAT_ID);
}
