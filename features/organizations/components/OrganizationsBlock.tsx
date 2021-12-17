import { useProfile } from "@/hooks";
import PageWrapper from "@/components/PageWrapper";
import React, { useMemo } from "react";
import Shimmer from "@/components/Shimmer";
import pluralize from "pluralize";

const OrganizationsBlock = () => {
  const { user, organizations, isLoading } = useProfile();

  const rolesByOrganizationId = useMemo(() => {
    const roles: { [orgId: number]: string } = {};

    // We need the user ID to compute this.
    if (!user?.id) return roles;

    // Cycle through all organizations
    organizations.map((org) => {
      // Cycle through all pivots
      org.users.map((orgUser) => {
        // When we find the organization get the role associate to the user
        if (orgUser?.user?.id === user.id && orgUser.role)
          roles[org.id] = orgUser.role.name;
      });
    });

    return roles;
  }, [user, organizations]);

  return (
    <PageWrapper.Section>
      <PageWrapper.Heading>Your Organizations</PageWrapper.Heading>
      <hr className="mb-4" />
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
              <Shimmer height={40} />
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
                  {rolesByOrganizationId[org.id] && (
                    <div className="text-sm">
                      <strong>Your role</strong>: {rolesByOrganizationId[org.id]}
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
