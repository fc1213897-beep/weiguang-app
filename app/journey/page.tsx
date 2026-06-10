import { redirect } from "next/navigation";

export default function JourneyRedirectPage() {
  redirect("/growth?tab=journey");
}
