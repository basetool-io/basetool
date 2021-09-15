import { Button } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/client";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import OrganizationContext from "@/lib/OrganizationContext"
import PageWrapper from "@/components/PageWrapper";
import React, { useContext } from "react";

function Profile() {
  const [session, sessionIsLoading] = useSession();
  const organization = useContext(OrganizationContext);

  return (
    <Layout>
      <PageWrapper heading={`Profile`}>
        <>
          {sessionIsLoading && <LoadingOverlay inPageWrapper />}
          {sessionIsLoading || (
            <div className="w-full h-full flex-1 flex flex-col justify-between">
              <div>
                <div>Name: {session?.user?.name}</div>
                <div>Email: {session?.user?.email}</div>
                <div>Organization: {organization?.name}</div>
              </div>
              <div className="flex justify-center">
                <Button
                  colorScheme="blue"
                  size="sm"
                  width="300px"
                  onClick={(e) => {
                    e.preventDefault();
                    signOut();
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </>
      </PageWrapper>
    </Layout>
  );
}

export default Profile;
