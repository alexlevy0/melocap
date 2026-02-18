export type WeekPhase = 'waiting' | 'open' | 'locked' | 'resolving' | 'finished';

/**
 * Returns the current date in Europe/Paris timezone
 */
export function getParisDate(): Date {
  const now = new Date();
  const parisString = now.toLocaleString("en-US", { timeZone: "Europe/Paris" });
  return new Date(parisString);
}

/**
 * Checks if the current time is within the active game window:
 * Friday 19:00 to Sunday 12:00 (Paris Time)
 */
export function isWeekendActive(): boolean {
  if (process.env.FORCE_WEEKEND === 'true') {
    return true;
  }

  const now = getParisDate();
  const day = now.getDay(); // 0 = Sunday, 5 = Friday
  const hour = now.getHours();

  // Friday after 19:00
  if (day === 5 && hour >= 19) {
    return true;
  }

  // Saturday (all day)
  if (day === 6) {
    return true;
  }

  // Sunday before 12:00
  if (day === 0 && hour < 12) {
    return true;
  }

  return false;
}

/**
 * Returns the next Friday 19:00 (Paris Time)
 */
export function getNextDropDate(): Date {
  const now = getParisDate();
  const day = now.getDay();
  const hour = now.getHours();

  const nextFriday = new Date(now);
  
  // Calculate days until next Friday
  let daysUntilFriday = 5 - day;
  
  // If we are already past Friday 19:00, target next week's Friday
  if (daysUntilFriday < 0 || (daysUntilFriday === 0 && hour >= 19)) {
    daysUntilFriday += 7;
  }
  
  nextFriday.setDate(now.getDate() + daysUntilFriday);
  nextFriday.setHours(19, 0, 0, 0);
  
  return nextFriday;
}

/**
 * Determines the current phase of the weekly cycle based on Paris time
 */
export function getPhase(): WeekPhase {
  if (process.env.FORCE_WEEKEND === 'true') {
    return 'open';
  }

  const now = getParisDate();
  const day = now.getDay();
  const hour = now.getHours();

  // Friday 19:00 - Sunday 12:00 -> OPEN (Phase 2 - La Fièvre)
  if (isWeekendActive()) {
    return 'open';
  }

  // Sunday 12:00 - Sunday 19:00 -> LOCKED (Phase 3)
  if (day === 0 && hour >= 12 && hour < 19) {
    return 'locked';
  }

  // Sunday 19:00 - Sunday 23:59 -> RESOLVING/FINISHED (Phase 4)
  // We'll consider it "approaching finished" or resolving. 
  // For UI simplicity, let's call it "finished" until Monday ? 
  // Or stick to "waiting" for the next drop immediately?
  // Docs say Phase 4 is Resolve at Sunday 19:00.
  // Phase 0 starts Monday 00:00.
  
  // Sunday 19:00 - 23:59
  if (day === 0 && hour >= 19) {
    return 'finished'; 
  }

  // Monday 00:00 - Friday 19:00 -> WAITING (Phase 0)
  return 'waiting';
}
