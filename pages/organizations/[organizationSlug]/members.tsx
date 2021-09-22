import { Button, Select } from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import { useBoolean } from "react-use"
import { useGetOrganizationQuery } from "@/features/organizations/api-slice";
import { useOrganizationFromContext } from "@/hooks";
import { useRouter } from "next/router";
import ColumnListItem from "@/components/ColumnListItem";
import Layout from "@/components/Layout";
import OrganizationSidebar from "@/components/OrganizationSidebar";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";
import { PlusIcon } from "@heroicons/react/outline"

const EditCurrentUser = ({
  organizationUser,
  organization,
  setLocalOrgUser
}: {
  organizationUser: any;
  organization: Organization;
  setLocalOrgUser: (user: any) => void
}) => {
  const user = useMemo(() => organizationUser.user, [organizationUser]);
  // const [user, setUser] = useState()
  const handleSave = () => {
    console.log("handleSave");
  };
  const changeUserRole = (roleId: string) => {
    console.log("changeUserRole", roleId);
    setLocalOrgUser({
      ...organizationUser,
      role: {
        ...organizationUser.role,
        id: roleId
      }
    })
    // setChanges({
    //   ...local,
    //   role: roleId
    // })
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
              <Select
                value={organizationUser.role?.id}
                onChange={(e) => {
                  changeUserRole(e.currentTarget.value);
                }}
              >
                {organization.roles.map((role: Record<string, any>) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </PageWrapper.Section>
          </>
        )}
        <pre>{JSON.stringify(organizationUser, null, 2)}</pre>
        <>{/* <pre>{JSON.stringify(organization, null, 2)}</pre> */}</>
      </div>

      <div className="grid grid-cols-3">
        <div></div>
        {/* <div>
          {!isCreateForm && !isAdminRole && (
            <a
              className="text-red-600 text-sm cursor-pointer"
              onClick={() => !isDeleting && handleDelete()}
            >
              Remove role
            </a>
          )}
        </div> */}
        <Button colorScheme="blue" size="sm" width="300px" onClick={handleSave}>
          Save
        </Button>
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
  const [localOrgUser, setLocalOrgUser] = useState()

  useEffect(() => {
    setLocalOrgUser(currentOrganizationUser)
  }, [currentOrganizationUser])

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
                organization?.users.map((user, idx: number) => (
                  <ColumnListItem
                    key={user?.user?.id}
                    active={user?.user?.id === currentUserId}
                    onClick={() => {
                      setCurrentUserId(user?.user?.id);
                      // toggleAddNew(false);
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
            {localOrgUser && organization && (
              <EditCurrentUser
                organizationUser={localOrgUser}
                organization={organization}
                setLocalOrgUser={setLocalOrgUser}
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
