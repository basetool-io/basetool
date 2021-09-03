import { ReactElement } from "react";
import { useSession } from "next-auth/client";
import UnauthenticatedView from "./UnauthenticatedView"

function Authenticated({ children }: { children: ReactElement}): ReactElement {
  const [session, isLoading] = useSession();

  if (isLoading) <div>Loading...</div>
  if (!isLoading && !session) return <UnauthenticatedView />

  return children;
}

export default Authenticated;
