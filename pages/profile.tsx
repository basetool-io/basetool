import { Button } from "@chakra-ui/react";
import { signOut } from "next-auth/client";
import Layout from "@/components/Layout";
import OrganizationsBlock from "@/features/organizations/components/OrganizationsBlock"
import PageWrapper from "@/components/PageWrapper";
import ProfileContext from "@/lib/ProfileContext";
import React, { useContext } from "react";

function Profile() {
  const { organizations, user, role } = useContext(ProfileContext);

  return (
    <Layout>
      <PageWrapper heading={`Profile`}>
        <>
          <div className="w-full h-full flex-1 flex flex-col justify-between">
            <div>
              <PageWrapper.Section>
                <>
                  <PageWrapper.Heading>General</PageWrapper.Heading>
                  <div>
                    Name: {user?.firstName} {user?.lastName}
                  </div>
                  <div>Email: {user?.email}</div>
                  <div>Role: {role?.name}</div>
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
