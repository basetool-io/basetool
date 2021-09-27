import { DataSource, Organization, User } from "@prisma/client";
import PageWrapper from "@/components/PageWrapper";
import ProfileContext from "@/lib/ProfileContext";
import React, { useContext } from "react";
import pluralize from "pluralize";

const OrganizationsBlock = () => {
  const { organizations } = useContext(ProfileContext);

  return (
    <PageWrapper.Section>
      <PageWrapper.Heading>Organizations</PageWrapper.Heading>
      <PageWrapper.Blocks>
        <>
          {organizations &&
            organizations.map(
              (
                org: Organization & { users: User[]; dataSources: DataSource[] }
              ) => {
                return (
                  <PageWrapper.Block
                    href={`/organizations/${org.slug}/members`}
                    key={org.id}
                  >
                    <div className="text-lg font-bold text-gray-800 mb-2">
                      {org.name}
                    </div>
                    <br />
                    {org?.dataSources && (
                      <div className="text-sm">
                        {org.dataSources.length}{" "}
                        {pluralize("data source", org.dataSources.length)}
                      </div>
                    )}
                    {org?.users && (
                      <div className="text-sm">
                        {org.users.length}{" "}
                        {pluralize("member", org.users.length)}
                      </div>
                    )}
                  </PageWrapper.Block>
                );
              }
            )}
        </>
      </PageWrapper.Blocks>
    </PageWrapper.Section>
  );
};

export default OrganizationsBlock;
