import {
  Button,
  Checkbox,
  CheckboxGroup,
  Code,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { Role } from "@prisma/client";
import { Save } from "react-feather";
import { getLabel } from "@/features/data-sources";
import { isArray, isNull, isUndefined, pick } from "lodash";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useGetRolesQuery } from "@/features/roles/api-slice";
import {
  useGetTablesQuery,
  usePrefetch,
  useUpdateTableMutation,
} from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import { useSegment } from "@/hooks";
import DataSourcesEditLayout from "@/features/data-sources/components/DataSourcesEditLayout";
import Link from "next/link";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect, useMemo, useState } from "react";
import Shimmer from "@/components/Shimmer";

function Edit() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;

  const { data: dataSourceResponse, isLoading: dataSourceIsLoading } =
    useGetDataSourceQuery(
      { dataSourceId },
      {
        skip: !dataSourceId,
      }
    );

  const { data: rolesResponse, isFetching: rolesAreFetching } =
    useGetRolesQuery(
      {
        organizationId: dataSourceResponse?.data?.organizationId,
      },
      { skip: !dataSourceResponse?.data?.organizationId }
    );

  const { data: tablesResponse } = useGetTablesQuery(
    {
      dataSourceId,
    },
    { skip: !dataSourceId }
  );

  const table = useMemo(() => {
    if (tablesResponse?.ok && isArray(tablesResponse?.data)) {
      return tablesResponse?.data.find(
        ({ name }: { name: string }) => name === tableName
      );
    }
  }, [tablesResponse, tableName]);

  const [localTable, setLocalTable] = useState<ListTable>();

  useEffect(() => {
    setLocalTable(table);
  }, [table]);

  const roles: Role[] = useMemo(
    () => (rolesResponse?.ok ? rolesResponse?.data : []),
    [rolesResponse]
  );

  const track = useSegment("Visited edit data source page", {
    page: "edit data source",
  });

  const [updateTable, { isLoading: isUpdating }] = useUpdateTableMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await updateTable({
      dataSourceId,
      tableName,
      body: pick(localTable, ["label", "authorizedRoles", "hidden"]),
    }).unwrap();

    track("Updated data source table");
  };

  const toggleChecked = (roleName: string) => {
    if (localTable?.authorizedRoles?.includes(roleName)) {
      setLocalTable({
        ...localTable,
        authorizedRoles: localTable.authorizedRoles
          .filter((name: string) => name !== roleName)
          .sort(),
      });
    } else {
      setLocalTable({
        ...(localTable as any),
        authorizedRoles: [
          ...(localTable?.authorizedRoles || []),
          roleName,
        ].sort(),
      });
    }
  };

  // This memo controls the checkbox checked state.
  const allRolesChecked = useMemo(() => {
    if (
      isUndefined(localTable?.authorizedRoles) ||
      isNull(localTable?.authorizedRoles)
    )
      return true;

    return false;
  }, [localTable]);
  const prefetchColumns = usePrefetch("getColumns");

  return (
    <DataSourcesEditLayout
      backLink={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}`}
      backLabel="Back to table"
      crumbs={[dataSourceResponse?.data.name, "Edit", table?.name]}
      isLoading={dataSourceIsLoading}
      footerElements={{
        center: (
          <Button
            colorScheme="blue"
            size="sm"
            width="300px"
            onClick={handleSubmit}
            isLoading={isUpdating}
            leftIcon={<Save className="h-4" />}
          >
            Save
          </Button>
        ),
      }}
    >
      <div className="flex-1 p-4">
        {table && (
          <div className="w-full h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between">
                <h3 className="uppercase text-md font-semibold">
                  {getLabel(table)}
                </h3>
                <div>
                  <Link
                    href={`/data-sources/${dataSourceId}/edit/tables/${tableName}/columns`}
                    passHref
                  >
                    <Button
                      as="a"
                      colorScheme="purple"
                      size="xs"
                      variant="outline"
                      onMouseEnter={() =>
                        prefetchColumns({
                          dataSourceId,
                          tableName,
                        })
                      }
                    >
                      Edit columns
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="divide-y">
                {localTable && (
                  <form onSubmit={handleSubmit}>
                    <OptionWrapper
                      helpText={
                        "You might want to call this table something different. This label will only be visible in basetool. It will not change the table name."
                      }
                    >
                      <FormControl id="name">
                        <FormLabel>
                          Table label <sup className="text-red-600">*</sup>
                        </FormLabel>
                        <Input
                          type="text"
                          name="name"
                          placeholder="Posts, My Users, Projects"
                          value={
                            isUndefined(localTable.label)
                              ? localTable.name
                              : localTable.label
                          }
                          isRequired={true}
                          onChange={(e) =>
                            setLocalTable({
                              ...localTable,
                              label: e.currentTarget.value,
                            })
                          }
                        />
                        <FormHelperText>
                          This table's original name is{" "}
                          <Code>{table.name}</Code>.
                        </FormHelperText>
                      </FormControl>
                    </OptionWrapper>

                    <OptionWrapper
                      helpText={
                        "Tables are visible to everyone by default. You can also restrict the visibility to certain roles by selecting them from the dropdown."
                      }
                    >
                      <FormControl id="access">
                        <FormLabel>Access by role</FormLabel>
                        {rolesAreFetching && <Shimmer width={85} height={22} />}
                        {rolesResponse?.ok && (
                          <CheckboxGroup size="md" colorScheme="gray">
                            <Checkbox
                              isChecked={allRolesChecked}
                              isDisabled={localTable.hidden}
                              onChange={(e) =>
                                setLocalTable({
                                  ...localTable,
                                  authorizedRoles: e.target.checked
                                    ? null
                                    : roles.map(({ name }) => name),
                                })
                              }
                            >
                              All roles
                            </Checkbox>
                            {!allRolesChecked && (
                              <Stack pl={6} mt={1} spacing={1}>
                                {roles &&
                                  roles.map((role: Role) => (
                                    <div key={role.name}>
                                      <Checkbox
                                        id={`role_authorization_${role.name}`}
                                        isChecked={localTable?.authorizedRoles?.includes(
                                          role.name
                                        )}
                                        isDisabled={localTable.hidden}
                                        onChange={() =>
                                          toggleChecked(role.name)
                                        }
                                        className="hidden"
                                      >
                                        {role.name}
                                      </Checkbox>
                                    </div>
                                  ))}
                              </Stack>
                            )}
                          </CheckboxGroup>
                        )}
                      </FormControl>
                    </OptionWrapper>

                    <OptionWrapper
                      helpText={"You can just hide this table altogether."}
                    >
                      <FormControl id="access">
                        <FormLabel>Hide table</FormLabel>
                        <CheckboxGroup size="md" colorScheme="gray">
                          <Checkbox
                            isChecked={localTable.hidden}
                            onChange={(e) =>
                              setLocalTable({
                                ...localTable,
                                hidden: e.target.checked,
                              })
                            }
                          >
                            Hidden
                          </Checkbox>
                        </CheckboxGroup>
                      </FormControl>
                    </OptionWrapper>
                  </form>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3">
              <div className="flex justify-start"></div>

              <div className="flex justify-end"></div>
            </div>
          </div>
        )}
      </div>
    </DataSourcesEditLayout>
  );
}

export default Edit;
