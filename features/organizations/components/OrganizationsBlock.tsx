import { useProfile } from "@/hooks";
import PageWrapper from "@/components/PageWrapper";
import React from "react";
import Shimmer from "@/components/Shimmer";
import pluralize from "pluralize";

const OrganizationsBlock = () => {
  const { organizations, isLoading } = useProfile();

  return (
    <PageWrapper.Section>
      <PageWrapper.Heading>Your Organizations</PageWrapper.Heading>
      {!isLoading &&
        organizations &&
        organizations.length === 0 &&
        `You don't belong to any Basetool organizations.`}
      <PageWrapper.Blocks>
        <>
          {isLoading && (
            <PageWrapper.Block href={`#`}>
              <div className="text-lg font-bold text-gray-800 mb-2">
                Loading
              </div>
              <br />
              <Shimmer height={40}/>
            </PageWrapper.Block>
          )}

          {organizations &&
            organizations.map((org) => {
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
                      {org.users.length} {pluralize("member", org.users.length)}
                    </div>
                  )}
                </PageWrapper.Block>
              );
            })}
        </>
      </PageWrapper.Blocks>
    </PageWrapper.Section>
  );
};

export default OrganizationsBlock;
