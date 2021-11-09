import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import { OWNER_ROLE, defaultAbilities } from "@/features/roles";
import { Organization, Role } from "@prisma/client";
import { PlusIcon } from "@heroicons/react/outline";
import { diff } from "deep-object-diff";
import { isEmpty, isFunction, omit } from "lodash";
import { useBoolean } from "react-use";
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetRolesQuery,
  useUpdateRoleMutation,
} from "@/features/roles/api-slice";
import { useOrganizationFromProfile, useSegment } from "@/hooks";
import { useRouter } from "next/router";
import ColumnListItem from "@/components/ColumnListItem";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import OrganizationSidebar from "@/components/OrganizationSidebar";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";

export type Ability = {
  id: string;
  label: string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
const RoleEditor = ({
  organization,
  currentRole = { id: "", name: "", options: {} },
  selectRole,
}: {
  organization: Organization;
  currentRole?:
    | Role
    | { id: ""; name: string; options: Record<string, unknown> };
  selectRole: (payload: { name: string }) => void;
}) => {
  const isCreateForm = currentRole.id === "";
  const [role, setRole] = useState(currentRole);
  const [abilities, setAbilities] = useState<Ability["id"][]>([]);

  const isOwnerRole = useMemo(
    () => currentRole?.name === OWNER_ROLE,
    [currentRole]
  );

  useSegment("Visited roles page", {
    page: "roles",
  });

  useEffect(() => {
    if (currentRole.id !== "") {
      setRole(currentRole);
    }

    if (isOwnerRole) {
      setAbilities(defaultAbilities.map(({ id }) => id));
    } else {
      // Don't try to set the abilities if you're just creating the role.
      if (!isCreateForm) {
        setAbilities(
          (currentRole?.options as any)?.abilities ||
            defaultAbilities.map(({ id }) => id)
        );
      }
    }
  }, [currentRole]);

  // Create a diff with changes to send to the server on update
  const changes = useMemo(() => diff(currentRole, role), [currentRole, role]);
  const roleId = useMemo(() => currentRole?.id?.toString(), [currentRole]);

  // Prepare mutations for create, update and delete
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isCreateForm) {
      const response = await createRole({
        organizationId: organization?.id.toString(),
        body: {
          changes: omit(role, ["id"]),
        },
      });
      selectRole({ name: (response as any)?.data?.data?.name });
    } else {
      const response = await updateRole({
        organizationId: organization?.id.toString(),
        roleId,
        body: {
          changes: role,
        },
      });
      selectRole({ name: (response as any)?.data?.data?.name });
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to remove this role?")) {
      await deleteRole({
        organizationId: organization?.id?.toString(),
        roleId,
      });

      if (isFunction(selectRole)) selectRole({ name: OWNER_ROLE });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div>
        <div>
          <h3 className="uppercase text-md font-semibold">
            {isCreateForm ? "Add a new role" : currentRole.name}
          </h3>
        </div>
        <div className="divide-y">
          <form onSubmit={handleSubmit}>
            <OptionWrapper
              helpText={
                isCreateForm
                  ? "Give this role a name to remember"
                  : "You might want to call this role something different"
              }
            >
              <FormControl id="name">
                <FormLabel>Role name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  placeholder="User, Sales, Marketing or something else"
                  value={role?.name}
                  disabled={isOwnerRole}
                  onChange={(e) => {
                    setRole({
                      ...role,
                      name: e.currentTarget.value,
                    });
                  }}
                />
                {isOwnerRole && (
                  <FormHelperText>
                    You can't change the name of this role.
                  </FormHelperText>
                )}
              </FormControl>
            </OptionWrapper>
            {!isCreateForm && (
              <>
                <OptionWrapper helpText="What can this role do?">
                  <FormControl id="abilities">
                    <CheckboxGroup
                      value={abilities}
                      onChange={(value) => {
                        setRole({
                          ...role,
                          options: {
                            ...(role.options as any),
                            abilities: value,
                          },
                        });
                        setAbilities(value as string[]);
                      }}
                    >
                      <FormLabel>Abilities</FormLabel>
                      <Stack direction="column">
                        {defaultAbilities.map(({ id, label }) => (
                          <Checkbox isDisabled={isOwnerRole} value={id}>
                            {label}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                    {isOwnerRole && (
                      <FormHelperText>
                        You can't change the name of this role.
                      </FormHelperText>
                    )}
                  </FormControl>
                </OptionWrapper>
              </>
            )}
          </form>
        </div>
      </div>
      <div className="grid grid-cols-3">
        <div>
          {!isCreateForm && !isOwnerRole && (
            <a
              className="text-red-600 text-sm cursor-pointer"
              onClick={() => !isDeleting && handleDelete()}
            >
              Remove role
            </a>
          )}
        </div>
        <Button
          colorScheme="blue"
          size="sm"
          width="300px"
          onClick={handleSubmit}
          disabled={isEmpty(changes)}
          isLoading={isCreating || isUpdating}
        >
          {isCreateForm ? "Create" : "Save"}
        </Button>
        <div className="flex justify-end"></div>
      </div>
    </div>
  );
};

function Roles() {
  const router = useRouter();
  const organization = useOrganizationFromProfile({
    slug: router.query.organizationSlug as string,
  });
  const [addNewRole, toggleAddNewRole] = useBoolean(false);
  const [currentRoleName, setCurrentRoleName] = useState<string>(OWNER_ROLE);

  const {
    data: rolesResponse,
    isLoading,
    isFetching,
  } = useGetRolesQuery(
    {
      organizationId: organization?.id?.toString(),
    },
    { skip: !organization?.id }
  );

  const roles = useMemo(
    () => (rolesResponse?.ok ? rolesResponse?.data : []),
    [rolesResponse]
  );
  const currentRole = useMemo(
    () => roles.find(({ name }: { name: string }) => name === currentRoleName),
    [roles, currentRoleName]
  );

  return (
    <Layout sidebar={<OrganizationSidebar organization={organization} />}>
      <PageWrapper crumbs={[organization?.name, "Roles"]} flush={true}>
        <div className="relative flex-1 max-w-full w-full flex">
          {(isLoading || isFetching) && <LoadingOverlay inPageWrapper />}
          <div className="flex flex-shrink-0 w-1/4 border-r">
            <div className="w-full relative p-4">
              <div className="mb-2">Roles</div>
              {roles &&
                roles.map((role: Role, idx: number) => (
                  <ColumnListItem
                    key={role.name}
                    active={role.name === currentRoleName && !addNewRole}
                    onClick={() => {
                      setCurrentRoleName(role.name);
                      toggleAddNewRole(false);
                    }}
                  >
                    {role.name}
                  </ColumnListItem>
                ))}

              <div className="mt-2">
                <ColumnListItem
                  active={addNewRole}
                  icon={<PlusIcon className="h-4" />}
                  onClick={() => toggleAddNewRole(true)}
                >
                  Add new role
                </ColumnListItem>
              </div>
            </div>
          </div>
          {organization && (
            <div className="flex-1 p-4">
              {addNewRole && (
                <RoleEditor
                  organization={organization}
                  selectRole={({ name }: { name: string }) => {
                    toggleAddNewRole(false);
                    setCurrentRoleName(name);
                  }}
                />
              )}
              {addNewRole || (
                <>
                  {!currentRole && "👈 Please select a role"}
                  {currentRole && (
                    <RoleEditor
                      organization={organization}
                      currentRole={currentRole}
                      selectRole={({ name }: { name: string }) => {
                        toggleAddNewRole(false);
                        setCurrentRoleName(name);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default Roles;
