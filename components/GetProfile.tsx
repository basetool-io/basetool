import { ProfileProvider } from "@/lib/ProfileContext"
import { useGetProfileQuery } from "@/features/profile/api-slice"
import { useSession } from "next-auth/client"
import React, { ReactNode, useMemo } from "react"

const GetProfile = ({ children }: { children: ReactNode }) => {
  const [session] = useSession();
  const { data: profileResponse, isLoading } = useGetProfileQuery(null, {
    skip: !session,
  }); // not sure why this method needs 1-2 args. I added null to stisfy that req.
  const profile = useMemo(
    () => (profileResponse?.ok ? profileResponse?.data : {}),
    [profileResponse, isLoading]
  );

  return <ProfileProvider value={profile}>{children}</ProfileProvider>;
};

export default GetProfile
