import { redirect } from "next/navigation";

// Root page redirects to the default locale
export default function RootPage() {
  redirect("/fr");
}
