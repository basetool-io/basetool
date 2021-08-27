import { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";

function Authenticated({ children }: { children: ReactElement}): ReactElement {
  const [session, isLoading] = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("session->", session);
    if (!isLoading && !session) router.push("/auth/login");
  }, [isLoading, session]);

  if (isLoading) <div>'Loading...'</div>

  return children;
}

export default Authenticated;
