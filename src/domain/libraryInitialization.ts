export function shouldCreateExampleThreat(initialized: boolean, threatCount: number): boolean {
  return !initialized && threatCount === 0;
}
