const nonBreakingSpace = '\u00A0';

/**
 * Format a duration in seconds into a ({#days}d {#hours}h {#minutes}m {#seconds}s) format
 * @param durationInSeconds
 */
export function formatSecondsIntoDhmsFormat(durationInSeconds: number) {
  const days = Math.floor(durationInSeconds / (60 * 60 * 24));
  const hours = Math.floor((durationInSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((durationInSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  return `${days}d${nonBreakingSpace}${hours}h${nonBreakingSpace}${minutes}m${nonBreakingSpace}${seconds}s`;
}
