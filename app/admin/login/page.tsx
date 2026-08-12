import { redirect } from "next/navigation";

/** The layout gate handles sign-in, so this route just returns to it. */
export default function AdminLoginPage() {
  redirect("/admin");
}
