import { Button } from "@chakra-ui/react";
import { signOut } from "next-auth/client";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import ProfileContext from "@/lib/ProfileContext"
import React, { useContext } from "react";

function Profile() {
  const { organization, user, role } = useContext(ProfileContext);

  return (
    <Layout>
      <PageWrapper heading={`Profile`}>
        <>
          <div className="w-full h-full flex-1 flex flex-col justify-between">
            <div>
              <div>Name: {user?.firstName} {user?.lastName}</div>
              <div>Email: {user?.email}</div>
              <div>Organization: {organization?.name}</div>
              <div>Role: {role?.name}</div>
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
