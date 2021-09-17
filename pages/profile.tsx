import { Button } from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import { signOut } from "next-auth/client";
import Layout from "@/components/Layout";
import Link from "next/link"
import PageWrapper from "@/components/PageWrapper";
import ProfileContext from "@/lib/ProfileContext";
import React, { useContext } from "react";

const Heading = ({ children }: { children: string }) => (
  <div className="text-xl border-b mb-4 pb-1">{children}</div>
);

function Profile() {
  const { organizations, user, role } = useContext(ProfileContext);

  return (
    <Layout>
      <PageWrapper heading={`Profile`}>
        <>
          <div className="w-full h-full flex-1 flex flex-col justify-between">
            <div>
              <div className="mt-4">
                <Heading>General</Heading>
                <div>
                  Name: {user?.firstName} {user?.lastName}
                </div>
                <div>Email: {user?.email}</div>
                <div>Role: {role?.name}</div>
                <div className="mt-4">
                  <Heading>Organizations</Heading>
                  <ol>
                    {organizations &&
                      organizations.map((organization: Organization) => (
                        <li key={organization.id}>
                          <Link href={`/organizations/${organization.id}/settings/roles`}>
                            <a>{organization.name}</a>
                          </Link>
                        </li>
                      ))}
                  </ol>
                </div>
              </div>
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
