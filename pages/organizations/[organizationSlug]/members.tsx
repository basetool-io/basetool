import { OWNER_ROLE } from "@/features/roles"
import { Organization, OrganizationUser, Role, User } from "@prisma/client";
import { PlusIcon } from "@heroicons/react/outline";
import { Select } from "@chakra-ui/react";
import { isUndefined } from "lodash";
import { useBoolean } from "react-use";
import { useGetOrganizationQuery, useRemoveMemberMutation, useUpdateMemberRoleMutation } from "@/features/organizations/api-slice";
import { useOrganizationFromContext } from "@/hooks";
import { useRouter } from "next/router";
import ColumnListItem from "@/components/ColumnListItem";
import Layout from "@/components/Layout";
import OrganizationSidebar from "@/components/OrganizationSidebar";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";

const RolesSelector = ({ roleId, roles, onChange }: {roleId: number, roles: Role[], onChange: (e: any) => void}) => {
  return (
    <Select value={roleId} onChange={onChange}>
      {roles.map((role: Record<string, any>) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </Select>
  );
};

const EditCurrentUser = ({
  organizationUser,
  organization,
}: {
  organizationUser?: any;
  organization: Organization & {users: User[], roles: Role[]};
}) => {
  const user = useMemo(() => organizationUser?.user, [organizationUser]);
  const [updateUserRole, {isLoading}] = useUpdateMemberRoleMutation()
  const changeUserRole = async (roleId: string) => {
    await updateUserRole({
      organizationId: organization?.id?.toString(),
      userId: organizationUser?.id?.toString(),
      body: {
        roleId: parseInt(roleId),
      },
    });
  };

  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();

  const handleDelete = async () => {
    if (isRemoving) return

    if (confirm("Are you sure you want to remove this member?")) {
      await removeMember({
        organizationId: organization?.id?.toString(),
        userId: organizationUser.id,
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div>
        {user && (
          <>
            <PageWrapper.Section>
              <PageWrapper.Heading>
                {user.firstName} {user.lastName}
              </PageWrapper.Heading>
              <div className="mb-2">Email: {user.email}</div>
              <RolesSelector
                roleId={organizationUser.role?.id}
                roles={organization?.roles}
                onChange={(e: any) => changeUserRole(e.currentTarget.value)}
              />
            </PageWrapper.Section>
          </>
        )}
      </div>

      <div className="grid grid-cols-3">
        <div>
          {organizationUser?.role?.name !== OWNER_ROLE && (
            <a
              className="text-red-600 text-sm cursor-pointer"
              onClick={handleDelete}
            >
              Remove member
            </a>
          )}
        </div>
        {/* <Button colorScheme="blue" size="sm" width="300px" onClick={handleSave}>
          Save
        </Button> */}
        <div className="flex justify-end"></div>
      </div>
    </div>
  );
};

function Members() {
  const router = useRouter();
  const [addNew, toggleAddNew] = useBoolean(false);
  const temporaryOrganization = useOrganizationFromContext({
    slug: router.query.organizationSlug as string,
  });
  const {
    data: organizationsResponse,
    isLoading,
    isFetching,
  } = useGetOrganizationQuery(
    { organizationId: temporaryOrganization?.id?.toString() },
    { skip: !temporaryOrganization?.id }
  );
  const organization = useMemo(
    () => organizationsResponse?.data,
    [organizationsResponse]
  );
  const [currentUserId, setCurrentUserId] = useState<number>();
  const currentOrganizationUser = useMemo(
    () =>
      organization?.users.find(
        (orgUser: any) => orgUser.user.id === currentUserId
      ),
    [currentUserId, organization?.users]
  );
  const currentUser = useMemo(
    () => currentOrganizationUser?.user,
    [currentOrganizationUser]
  );
  const [localOrgUser, setLocalOrgUser] = useState();

  useEffect(() => {
    if (isUndefined(currentUserId) && organization?.users?.length > 0) {
      setCurrentUserId(organization.users[0]?.user?.id);
    }
  }, []);

  useEffect(() => {
    setLocalOrgUser(currentOrganizationUser);
  }, [currentOrganizationUser]);

  return (
    <Layout sidebar={<OrganizationSidebar organization={organization} />}>
      <PageWrapper
        crumbs={[organization?.name, "Members"]}
        flush={true}
        isLoading={isLoading || isFetching}
      >
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r">
            <div className="w-full relative p-4">
              <div className="mb-2">Members</div>
              {organization?.users &&
                organization?.users.map((user: OrganizationUser & {user: User}, idx: number) => (
                  <ColumnListItem
                    key={user?.user?.id}
                    active={user?.user?.id === currentUserId && !addNew}
                    onClick={() => {
                      setCurrentUserId(user?.user?.id);
                      toggleAddNew(false);
                    }}
                  >
                    {user?.user?.firstName} {user?.user?.lastName}
                  </ColumnListItem>
                ))}

              <div className="mt-2">
                <ColumnListItem
                  active={addNew}
                  icon={<PlusIcon className="h-4" />}
                  onClick={() => toggleAddNew(true)}
                >
                  Invite member
                </ColumnListItem>
              </div>
            </div>
          </div>
          <div className="flex-1 p-4">
            {!addNew && localOrgUser && organization && (
              <EditCurrentUser
                organizationUser={localOrgUser}
                organization={organization}
              />
            )}
            {addNew && organization && (
              <EditCurrentUser
                organization={organization}
              />
            )}
          </div>
        </div>
        {/* {organization && (
            <div className="flex-1 p-4">
              {addNew && (
                <RoleEditor
                  organization={organization}
                  selectRole={({ name }: { name: string }) => {
                    toggleAddNew(false);
                    setCurrentUserId(name);
                  }}
                />
              )}
              {addNew || (
                <>
                  {!currentRole && "👈 Please select a role"}
                  {currentRole && (
                    <RoleEditor
                      organization={organization}
                      currentRole={currentRole}
                      selectRole={({ name }: { name: string }) => {
                        toggleAddNew(false);
                        setCurrentUserId(name);
                      }}
                    />
                  )}
                </>
              )} */}
        {/* </div> */}
        {/* )} */}
      </PageWrapper>
    </Layout>
  );
}

export default Members;
