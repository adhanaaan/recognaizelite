/**
 * Ordinal suffix for a number spoken as a rank — "71st", not "71th".
 *
 * The teens are the exception that makes a naive `% 10` wrong: 11th, 12th and
 * 13th, and again at 111th, 112th, 113th.
 *
 * Duplicated deliberately from src/server/emails/shared.ts rather than shared
 * with it: that module is server-only and importing it from a page would pull
 * server code into the client bundle.
 */
export function ordinalSuffix(n: number): string {
  const mod100 = Math.abs(n) % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (Math.abs(n) % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
