import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { ListTable } from "@/plugins/data-sources/postgresql/types";
import { TrashIcon } from "@heroicons/react/outline";
import { diff } from "deep-object-diff";
import { getLabel } from "@/features/data-sources";
import { isEmpty } from "lodash";
import { toast } from "react-toastify";
import {
  useGetDataSourceQuery,
  useGetTablesQuery,
  useRemoveDataSourceMutation,
  useUpdateDataSourceMutation,
} from "@/features/data-sources/api-slice";
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

  const changes = useMemo(
    () => diff(currentTable, table),
    [currentTable, table]
  );

  const [updateTable, { isLoading: isUpdating }] =
    useUpdateDataSourceMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await updateTable({
      dataSourceId: dataSourceId,
      body: {
        [currentTable.name]: {
          label: table.label,
        },
      },
    });

    selectTable(currentTable.name);
  };

  const tableLabel = useMemo(() => getLabel(table), [table]);

  useEffect(() => {
    setTable(currentTable);
  }, [currentTable])

  return (
    <>
      <div className="w-full h-full flex flex-col justify-between">
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
        heading={
          <PageWrapper.TitleCrumbs
            crumbs={[dataSourceResponse?.data?.name, "Edit"]}
          />
        }
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

  return (
    <Layout hideSidebar={true}>
      {isLoading && <LoadingOverlay transparent={true} />}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {data?.ok && <TablesEditor tables={data?.data} />}
    </Layout>
  );
}

export default Edit;
