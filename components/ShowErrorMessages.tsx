import { ReactNode, useEffect } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/router"

const ShowErrorMessages = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    if (router.query.errorMessage) toast.error(router.query.errorMessage);
  }, [router.query.errorMessage]);

  return <>{children}</>;
};

export default ShowErrorMessages
