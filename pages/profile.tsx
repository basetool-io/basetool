import { Button } from "@chakra-ui/react";
import { signOut } from "next-auth/client";
import { useProfile, useSegment } from "@/hooks";
import Layout from "@/components/Layout";
import OrganizationsBlock from "@/features/organizations/components/OrganizationsBlock";
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function Profile() {
  const { user, role, isLoading } = useProfile();

  useSegment("Visited profile page", {
    page: "profile",
  });

  return (
    <Layout hideSidebar={true}>
      <PageWrapper heading={`Profile`}>
        <>
          <div className="w-full h-full flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              <PageWrapper.Section>
                <>
                  <PageWrapper.Heading>General</PageWrapper.Heading>
                  <hr className="mb-4" />
                  {isLoading && "Loading"}
                  {!isLoading && (
                    <>
                      <div>
                        Name: {user?.firstName} {user?.lastName}
                      </div>
                      <div>Email: {user?.email}</div>
                    </>
                  )}
                </>
              </PageWrapper.Section>
              <OrganizationsBlock />
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
        </>
      </PageWrapper>
    </Layout>
  );
}

export default Profile;
