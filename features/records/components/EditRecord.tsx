import { Column } from "@/features/fields/types";
import { Views } from "@/features/fields/enums";
import { getFilteredColumns } from "@/features/fields";
import { isEmpty, sortBy } from "lodash";
import { useAccessControl, useDataSourceContext, useProfile } from "@/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useGetRecordQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import Form from "@/features/records/components/Form";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import React, { memo, useEffect, useMemo } from "react";

const EditRecord = () => {
  const router = useRouter();
  const { dataSourceId, tableName, recordId, recordsPath } =
    useDataSourceContext();

  const {
    data: recordResponse,
    error,
    isLoading,
  } = useGetRecordQuery(
    {
      dataSourceId,
      tableName,
      recordId,
    },
    { skip: !dataSourceId || !tableName || !recordId }
  );
  const { data: columnsResponse } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  const columns = useMemo(
    () =>
      sortBy(getFilteredColumns(columnsResponse?.data, Views.edit), [
        (column: Column) => column?.baseOptions?.orderIndex,
      ]),
    [columnsResponse?.data]
  );

  const { isLoading: profileIsLoading } = useProfile();
  const ac = useAccessControl();
  const canEdit = useMemo(() => {
    if (profileIsLoading) return true;

    return ac.updateAny("record").granted;
  }, [ac, profileIsLoading]);

  // Redirect to record page if the user can't edit
  useEffect(() => {
    if (!canEdit) {
      router.push(`${recordsPath}/${recordId}`);
    }
  }, [canEdit]);

  // Don't show them the edit page if the user can't edit
  if (!canEdit) return null;

  return (
    <Layout>
      {isLoading && (
        <LoadingOverlay transparent={isEmpty(recordResponse?.data)} />
      )}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && recordResponse?.ok && columnsResponse?.ok && (
        <Form record={recordResponse.data} columns={columns} />
      )}
    </Layout>
  );
};

export default memo(EditRecord);
