
/**
 * Checks if the provided email is in the list of admin emails.
 * The list is defined in the ADMIN_EMAILS environment variable, separated by commas.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const adminEmails = process.env.ADMIN_EMAILS || "";
  const allowedEmails = adminEmails.split(",").map((e) => e.trim().toLowerCase());
  
  return allowedEmails.includes(email.toLowerCase());
}
