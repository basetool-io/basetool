import {
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Code,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import { ListTable } from "@/plugins/data-sources/postgresql/types";
import { Role } from "@prisma/client";
import { TrashIcon } from "@heroicons/react/outline";
import { getLabel } from "@/features/data-sources";
import { isEmpty, isNull, isUndefined } from "lodash";
import { toast } from "react-toastify";
import {
  useGetDataSourceQuery,
  useRemoveDataSourceMutation,
  useUpdateDataSourceMutation,
} from "@/features/data-sources/api-slice";
import { useGetRolesQuery } from "@/features/roles/api-slice";
import { useGetTablesQuery } from "@/features/tables/api-slice"
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import ColumnListItem from "@/components/ColumnListItem";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";

const TableEditor = ({
  currentTable,
  selectTable,
}: {
  currentTable: ListTable;
  selectTable: (name: string) => void;
}) => {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const { data: dataSourceResponse, isLoading: dataSourceIsLoading } =
    useGetDataSourceQuery(
      { dataSourceId },
      {
        skip: !dataSourceId,
      }
    );

  const {
    data: rolesResponse,
    isLoading: rolesIsLoading,
    isFetching: rolesIsFetching,
  } = useGetRolesQuery(
    {
      organizationId: dataSourceResponse?.data?.organizationId,
    },
    { skip: !dataSourceResponse?.data?.organizationId }
  );

  const [tableLabel, setTableLabel] = useState("");
  const [checkedRoles, setCheckedRoles] = useState<string[] | null>(null);
  const table = useMemo(
    () => ({
      name: currentTable.name,
      label: tableLabel,
      authorizedRoles: checkedRoles,
    }),
    [currentTable, tableLabel, checkedRoles]
  );

  // This is the payload that we're sending to the server
  const options: any = useMemo(() => {
    const dsOptions = dataSourceResponse?.data?.options;

    return {
      ...dsOptions,
      tables: {
        ...dsOptions.tables,
        [table.name]: table,
      },
    };
  }, [table, dataSourceResponse?.data?.options]);

  const storedTabledOptions = useMemo(
    () => dataSourceResponse?.data?.options.tables[table.name],
    [dataSourceResponse?.data?.options.tables[table.name]]
  );
  const authorizedRoles: string[] | undefined = useMemo(
    () => storedTabledOptions?.authorizedRoles,
    [storedTabledOptions]
  );
  const roles: Role[] = useMemo(
    () => (rolesResponse?.ok ? rolesResponse?.data : []),
    [rolesResponse]
  );

  const [updateTable, { isLoading: isUpdating }] =
    useUpdateDataSourceMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await updateTable({
      dataSourceId,
      body: options,
    });

    selectTable(currentTable.name);
  };

  const toggleAllRoles = (value: boolean) => {
    if (value) {
      setCheckedRoles(null);
    } else {
      setCheckedRoles(roles.map((role: Role) => role.name).sort());
    }
  };

  const toggleChecked = (roleName: string) => {
    if (!checkedRoles) return;

    if (checkedRoles.includes(roleName)) {
      setCheckedRoles(checkedRoles.filter((item) => item !== roleName).sort());
    } else {
      setCheckedRoles([...checkedRoles, roleName].sort());
    }
  };

  // This effect helps us populate the checkedRoles checkboxes
  useEffect(() => {
    if (isNull(authorizedRoles) || isUndefined(authorizedRoles)) {
      setCheckedRoles(null);
    } else if (isEmpty(authorizedRoles)) {
      setCheckedRoles([]);
    } else {
      const existingNames = roles
        .filter(({ name }) => authorizedRoles?.includes(name))
        .map(({ name }) => name)
        .sort();
      setCheckedRoles(existingNames);
    }
  }, [authorizedRoles]);

  // This effect helps us populate the checkedRoles checkboxes
  useEffect(() => {
    setTableLabel(getLabel(currentTable));
  }, [currentTable]);

  return (
    <>
      <div className="w-full h-full flex flex-col justify-between">
        {(dataSourceIsLoading || rolesIsLoading || rolesIsFetching) && (
          <LoadingOverlay inPageWrapper />
        )}
        <div>
          <div>
            <h3 className="uppercase text-md font-semibold">
              {getLabel(currentTable)}
            </h3>
          </div>
          <div className="divide-y">
            <form onSubmit={handleSubmit}>
              <OptionWrapper
                helpText={
                  "You might want to call this table something different"
                }
              >
                <FormControl id="name">
                  <FormLabel>
                    Table name <sup className="text-red-600">*</sup>
                  </FormLabel>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Posts, My Users or something else"
                    value={tableLabel}
                    isRequired={true}
                    onChange={(e) => setTableLabel(e.currentTarget.value)}
                  />
                  <FormHelperText>
                    Original name for this table is <Code>{table.name}</Code>.
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
                  <CheckboxGroup size="md" colorScheme="gray">
                    <Checkbox
                      isChecked={isNull(checkedRoles)}
                      onChange={(e) => toggleAllRoles(e.target.checked)}
                    >
                      All roles
                    </Checkbox>
                    {!isNull(checkedRoles) && (
                      <Stack pl={6} mt={1} spacing={1}>
                        {roles &&
                          roles.map((role: Role) => (
                            <div key={role.name}>
                              <Checkbox
                                id={`role_authorization_${role.name}`}
                                isChecked={checkedRoles.includes(role.name)}
                                onChange={(e) => toggleChecked(role.name)}
                                className="hidden"
                              >
                                {role.name}
                              </Checkbox>
                            </div>
                          ))}
                      </Stack>
                    )}
                  </CheckboxGroup>
                </FormControl>
              </OptionWrapper>
            </form>
          </div>
        </div>
        <div className="grid grid-cols-3">
          <div className="flex justify-start1"></div>

          <Button
            colorScheme="blue"
            size="sm"
            width="300px"
            onClick={handleSubmit}
            isLoading={isUpdating}
          >
            Save
          </Button>
          <div className="flex justify-end"></div>
        </div>
      </div>
    </>
  );
};

function Edit() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const [currentTableName, setCurrentTableName] = useState<string>();
  const [hasBeenRemoved, setHasBeenRemoved] = useState(false); // This is used to update the UI about the removal of the DS
  const { data: dataSourceResponse, isLoading: dataSourceIsLoading } =
    useGetDataSourceQuery(
      { dataSourceId },
      {
        skip: !dataSourceId,
      }
    );
  const {
    data: tablesResponse,
    error,
    isLoading,
    isFetching,
    refetch: refetchTables,
  } = useGetTablesQuery(
    {
      dataSourceId,
    },
    { skip: !dataSourceId }
  );

  const { isLoading: rolesIsLoading } = useGetRolesQuery(
    {
      organizationId: dataSourceResponse?.data?.organizationId,
    },
    { skip: !dataSourceResponse?.data?.organizationId }
  );
  const tables = useMemo(
    () => (tablesResponse?.ok ? tablesResponse?.data : []),
    [tablesResponse?.data]
  );

  const currentTable = useMemo(
    () =>
      tables.find(({ name }: { name: string }) => name === currentTableName),
    [
      tables,
      currentTableName,
      tablesResponse?.data?.options?.tables[currentTableName as string],
    ]
  );

  const [removeDataSource, { isLoading: dataSourceIsRemoving }] =
    useRemoveDataSourceMutation();

  const handleRemove = async () => {
    if (dataSourceIsLoading || dataSourceIsRemoving || hasBeenRemoved) return;

    const confirmed = confirm(
      "Are you sure you want to remove this data source? All information about it (settings included) will be completely removed from our servers."
    );
    if (confirmed) {
      toast(
        "The data source has been removed. You will be redirected to the homepage. Thank you!"
      );

      await removeDataSource({ dataSourceId });
      setHasBeenRemoved(true);

      await setTimeout(async () => {
        await router.push("/");
      }, 3000);
    }
  };

  const backLink = `/data-sources/${router.query.dataSourceId}/`;

  return (
    <Layout hideSidebar={true}>
      {(isLoading || isFetching || rolesIsLoading || dataSourceIsLoading) && (
        <LoadingOverlay transparent={true} />
      )}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {tablesResponse?.ok && (
        <>
          <PageWrapper
            crumbs={[dataSourceResponse?.data?.name, "Edit"]}
            buttons={
              <ButtonGroup size="xs">
                <BackButton href={backLink} />
                <Button
                  colorScheme="red"
                  onClick={handleRemove}
                  isLoading={dataSourceIsRemoving}
                  leftIcon={<TrashIcon className="h-4" />}
                >
                  {hasBeenRemoved
                    ? "Removed"
                    : dataSourceIsRemoving
                    ? "Removing"
                    : "Remove data source"}
                </Button>
              </ButtonGroup>
            }
            flush={true}
          >
            <div className="relative flex-1 max-w-full w-full flex">
              <div className="flex flex-shrink-0 w-1/4 border-r">
                <div className="w-full relative p-4">
                  <div className="mb-2">Tables</div>
                  {tables &&
                    tables.map((table: ListTable) => {
                      return (
                        <ColumnListItem
                          key={table.name}
                          active={table.name === currentTable?.name}
                          onClick={() => setCurrentTableName(table.name)}
                        >
                          {/* <pre>{JSON.stringify(table, null, 2)}</pre> */}
                          {getLabel(table)}
                        </ColumnListItem>
                      );
                    })}
                </div>
              </div>
              <div className="flex-1 p-4">
                {!currentTable && "👈 Please select a table"}
                {currentTable && (
                  <TableEditor
                    currentTable={currentTable}
                    selectTable={async (name: string) => {
                      await refetchTables();
                      setCurrentTableName(name);
                    }}
                  />
                )}
              </div>
            </div>
          </PageWrapper>
        </>
      )}
    </Layout>
  );
}

export default Edit;
