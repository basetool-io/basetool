import { Button } from "@chakra-ui/react";
import { signOut } from "next-auth/client";
import { useProfile } from "@/hooks";
import Layout from "@/components/Layout";
import OrganizationsBlock from "@/features/organizations/components/OrganizationsBlock";
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function Profile() {
  const { user, role, isLoading } = useProfile();

  return (
    <Layout>
      <PageWrapper heading={`Profile`}>
        <>
          <div className="w-full h-full flex-1 flex flex-col justify-between">
            <div>
              <PageWrapper.Section>
                <>
                  <PageWrapper.Heading>General</PageWrapper.Heading>
                  {isLoading && "Loading"}
                  {!isLoading && (
                    <>
                      <div>
                        Name: {user?.firstName} {user?.lastName}
                      </div>
                      <div>Email: {user?.email}</div>
                      <div>Role: {role?.name}</div>
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
