import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";

function Authenticated({ children }: { children: ReactNode | null }) {
  const [session, isLoading] = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("session->", session);
    if (!isLoading && !session) router.push("/auth/login");
  }, [isLoading, session]);

  if (isLoading) return "Loading...";

  return children;
}

export default Authenticated;
