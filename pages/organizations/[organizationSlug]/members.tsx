import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { OWNER_ROLE } from "@/features/roles";
import { Organization, OrganizationUser, Role, User } from "@prisma/client";
import { PlusIcon } from "@heroicons/react/outline";
import { isUndefined } from "lodash";
import { useBoolean } from "react-use";
import {
  useGetOrganizationQuery,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} from "@/features/organizations/api-slice";
import { useInviteMemberMutation } from "@/features/organizations/api-slice";
import { useOrganizationFromContext, useProfile } from "@/hooks";
import { useRouter } from "next/router";
import ColumnListItem from "@/components/ColumnListItem";
import Layout from "@/components/Layout";
import OrganizationSidebar from "@/components/OrganizationSidebar";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";

type CustomOrganization = Organization & { users: User[]; roles: Role[] };
const ADD_NEW_ROLE_ID = "addNewRole";

const RolesSelector = ({
  roleId,
  roles,
  onChange,
  organizationSlug,
}: {
  roleId?: number;
  roles: Role[];
  onChange: (e: any) => void;
  organizationSlug: string;
}) => {
  const router = useRouter();
  const { role: profileRole } = useProfile();

  const handleChange = async (e: any) => {
    if (e.currentTarget.value === ADD_NEW_ROLE_ID) {
      await router.push(`/organizations/${organizationSlug}/roles`);
    } else {
      onChange(e);
    }
  };

  return (
    <FormControl id="role">
      <FormLabel>Role</FormLabel>
      <Select value={roleId} onChange={handleChange}>
        {roles
          .filter(
            (role: Record<string, any>) =>
              profileRole.name === OWNER_ROLE ||
              (profileRole.name !== OWNER_ROLE && role.name !== OWNER_ROLE)
          )
          .map((role: Record<string, any>) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        <optgroup label="-"></optgroup>
        <option value={ADD_NEW_ROLE_ID}>+ Add new role</option>
      </Select>
    </FormControl>
  );
};

const EditCurrentUser = ({
  organizationUser,
  organization,
}: {
  organizationUser?: any;
  organization: CustomOrganization;
}) => {
  const user = useMemo(() => organizationUser?.user, [organizationUser]);
  const [updateUserRole, { isLoading }] = useUpdateMemberRoleMutation();
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
    if (isRemoving) return;

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
                organizationSlug={organization.slug}
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

const CreateUser = ({ organization }: { organization: CustomOrganization }) => {
  const [user, setUser] = useState({
    email: "",
    roleId: organization?.roles[0]?.id,
  });
  const [inviteMember, { isLoading }] = useInviteMemberMutation();

  const handleInvite = async (e: any) => {
    e.preventDefault();

    await inviteMember({
      organizationId: organization.id.toString(),
      body: user,
    });

    setUser({
      email: "",
      roleId: organization?.roles[0]?.id,
    });
  };

  return (
    <form onSubmit={handleInvite} className="h-full">
      <div className="w-full h-full flex flex-col justify-between">
        <div>
          {user && (
            <>
              <PageWrapper.Section>
                <PageWrapper.Heading>Invite member</PageWrapper.Heading>
                <div className="space-y-4">
                  <FormControl id="email">
                    <FormLabel>Email address</FormLabel>
                    <Input
                      type="email"
                      value={user.email}
                      placeholder="tim@apple.com"
                      onChange={(e) =>
                        setUser({
                          ...user,
                          email: e.currentTarget.value,
                        })
                      }
                    />
                    <FormHelperText>Your teammates work email.</FormHelperText>
                  </FormControl>

                  <RolesSelector
                    organizationSlug={organization.slug}
                    roleId={user.roleId}
                    roles={organization?.roles}
                    onChange={(e: any) =>
                      setUser({
                        ...user,
                        roleId: parseInt(e.currentTarget.value),
                      })
                    }
                  />
                </div>
              </PageWrapper.Section>
            </>
          )}
        </div>

        <div className="grid grid-cols-3">
          <div></div>
          <Button
            colorScheme="blue"
            size="sm"
            width="300px"
            type="submit"
            isLoading={isLoading}
          >
            Invite
          </Button>
          <div></div>
        </div>
      </div>
    </form>
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
  const userLabel = (user: {
    user: {
      firstName?: string;
      lastName?: string;
      email: string;
    };
  }) => {
    if (user?.user?.firstName && user?.user?.lastName) {
      return `${user?.user?.firstName} ${user?.user?.lastName}`;
    }

    return user?.user?.email;
  };

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
                organization?.users.map(
                  (user: OrganizationUser & { user: User }, idx: number) => (
                    <ColumnListItem
                      key={user?.user?.id}
                      active={user?.user?.id === currentUserId && !addNew}
                      onClick={() => {
                        setCurrentUserId(user?.user?.id);
                        toggleAddNew(false);
                      }}
                    >
                      {userLabel(user as any)}
                    </ColumnListItem>
                  )
                )}

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
              <CreateUser organization={organization} />
            )}
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default Members;
