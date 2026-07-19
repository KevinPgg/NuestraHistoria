import { redirect } from "next/navigation";

export default function Home() {
  // La raíz lleva al feed; el middleware manda a /login si no hay sesión.
  redirect("/feed");
}
