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
import { cloneDeep, isEmpty, isUndefined } from "lodash";
import { diff } from "deep-object-diff";
import { getLabel } from "@/features/data-sources";
import { toast } from "react-toastify";
import {
  useGetDataSourceQuery,
  useGetTablesQuery,
  useRemoveDataSourceMutation,
  useUpdateDataSourceMutation,
} from "@/features/data-sources/api-slice";
import { useGetRolesQuery } from "@/features/roles/api-slice";
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

  const [table, setTable] = useState(currentTable);

  const changes = useMemo(() => {
    if (
      currentTable?.authorizedRoles &&
      table?.authorizedRoles &&
      !isEmpty(diff(currentTable.authorizedRoles, table.authorizedRoles))
    ) {
      const copyCurrentTable = { ...currentTable };
      const copyTable = { ...table };

      const currentTableAuthorizedRoles = [...currentTable.authorizedRoles];
      currentTableAuthorizedRoles.sort();
      const tableAuthorizedRoles = [...table.authorizedRoles];
      tableAuthorizedRoles.sort();

      delete copyCurrentTable.authorizedRoles;
      delete copyTable.authorizedRoles;

      return (
        diff(copyCurrentTable, copyTable) &&
        diff(currentTableAuthorizedRoles, tableAuthorizedRoles)
      );
    }

    return diff(currentTable, table);
  }, [currentTable, table]);

  const [updateTable, { isLoading: isUpdating }] =
    useUpdateDataSourceMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const options = dataSourceResponse
      ? cloneDeep(dataSourceResponse.data.options)
      : {};

    const mergedOptions = {
      ...options,
      tables: {
        ...options.tables,
        [table.name]: {
          label: table.label,
          authorizedRoles: table.authorizedRoles,
        },
      },
    };

    await updateTable({
      dataSourceId: dataSourceId,
      body: mergedOptions,
    });

    selectTable(currentTable.name);
  };

  const tableLabel = useMemo(() => getLabel(table), [table]);

  useEffect(() => {
    setTable(currentTable);
  }, [currentTable]);

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

  const roles = useMemo(
    () => (rolesResponse?.ok ? rolesResponse?.data : []),
    [rolesResponse]
  );

  const [checkedRoles, setCheckedRoles] = useState<string[]>([]);

  const allChecked =
    checkedRoles.length === roles.length && checkedRoles.length > 0;
  const isIndeterminate = checkedRoles.length > 0 && !allChecked;

  const toggleAllChecked = (value: boolean) => {
    setCheckedRoles([]);
    if (value) setCheckedRoles(roles.map((role: Role) => role.name));
  };

  const toggleChecked = (roleName: string) => {
    if (checkedRoles.includes(roleName)) {
      setCheckedRoles(checkedRoles.filter((item) => item !== roleName));
    } else {
      setCheckedRoles([...checkedRoles, roleName]);
    }
  };

  useEffect(() => {
    setTable({
      ...table,
      authorizedRoles: checkedRoles,
    });
  }, [checkedRoles]);

  useEffect(() => {
    if (isUndefined(currentTable.authorizedRoles)) {
      setCheckedRoles(roles.map((role: Role) => role.name));
    } else if (isEmpty(currentTable.authorizedRoles)) {
      setCheckedRoles([]);
    } else {
      const existingNames = roles
        .filter((role: Role) => {
          if (currentTable.authorizedRoles)
            return currentTable.authorizedRoles.includes(role.name);
        })
        .map((role: Role) => role.name);
      setCheckedRoles(existingNames);
    }
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
                    onChange={(e) => {
                      setTable({
                        ...table,
                        label: e.currentTarget.value,
                      });
                    }}
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
                      isChecked={allChecked}
                      isIndeterminate={isIndeterminate}
                      onChange={(e) => toggleAllChecked(e.target.checked)}
                    >
                      All roles
                    </Checkbox>
                    <Stack pl={6} mt={1} spacing={1}>
                      {roles &&
                        roles.map((role: Role) => (
                          <div key={role.name} className={allChecked ? "hidden" : ""}>
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
            disabled={isEmpty(changes)}
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

const TablesEditor = ({ tables }: { tables: ListTable[] }) => {
  const [currentTableName, setCurrentTableName] = useState<string>();
  const currentTable = useMemo(
    () =>
      tables.find(({ name }: { name: string }) => name === currentTableName),
    [tables, currentTableName]
  );

  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const [hasBeenRemoved, setHasBeenRemoved] = useState(false); // This is used to update the UI about the removal of the DS
  const { data: dataSourceResponse, isLoading: dataSourceIsLoading } =
    useGetDataSourceQuery(
      { dataSourceId },
      {
        skip: !dataSourceId,
      }
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
    <>
      <PageWrapper
        crumbs={[dataSourceResponse?.data?.name, "Edit"]}
        buttons={
          <ButtonGroup size="sm">
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
                tables.map((tab) => {
                  return (
                    <ColumnListItem
                      key={tab.name}
                      active={tab.name === currentTable?.name}
                      onClick={() => setCurrentTableName(tab.name)}
                    >
                      {getLabel(tab)}
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
                selectTable={(name: string) => {
                  setCurrentTableName(name);
                }}
              />
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

function Edit() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;

  const { data, error, isLoading } = useGetTablesQuery(
    {
      dataSourceId,
    },
    { skip: !dataSourceId }
  );

  // Get the datasource and the roles to load everything in one go and not show a new loading screen when the user selectes a table.
  const { data: dataSourceResponse, isLoading: dataSourceIsLoading } =
    useGetDataSourceQuery(
      { dataSourceId },
      {
        skip: !dataSourceId,
      }
    );

  const { isLoading: rolesIsLoading } = useGetRolesQuery(
    {
      organizationId: dataSourceResponse?.data?.organizationId,
    },
    { skip: !dataSourceResponse?.data?.organizationId }
  );

  return (
    <Layout hideSidebar={true}>
      {(isLoading || rolesIsLoading || dataSourceIsLoading) && (
        <LoadingOverlay transparent={true} />
      )}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {data?.ok && <TablesEditor tables={data?.data} />}
    </Layout>
  );
}

export default Edit;
