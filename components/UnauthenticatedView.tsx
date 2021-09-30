import { useRouter } from "next/router";
import PageWrapper from "./PageWrapper"
import React, { memo, useEffect } from "react";

function UnauthenticatedView() {
  const router = useRouter();
  useEffect(() => {
    router.push("/auth/login");
  }, []);

  return (
    <div className="flex h-full w-full">
      <PageWrapper isLoading={true}>
        <>&nbsp;1</>
      </PageWrapper>
    </div>
  );
}

export default memo(UnauthenticatedView);
