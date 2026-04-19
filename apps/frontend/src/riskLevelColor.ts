/** Maps API `riskLevel` strings to a readable accent color. */
export function riskLevelColor(level: string): string {
  switch (level) {
    case 'critical':
      return '#c62828';
    case 'high':
      return '#e65100';
    case 'medium':
      return '#f57c00';
    case 'clean':
    default:
      return '#2e7d32';
  }
}
