import {
  useGetDataSourceQuery,
  useGetSheetsQuery,
  useSetSheetToDataSourceMutation,
} from "@/features/data-sources/api-slice";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { useState } from "react";

function GoogleSheetsSetup() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const dataSourceName = "google-sheets";
  const [isReloading, setIsReloading] = useState(false);
  const { refetch: refetchDataSource } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );
  const { refetch: refetchTables } = useGetTablesQuery(
    { dataSourceId },
    { skip: !dataSourceId }
  );
  const { data: sheetsResponse, isLoading } = useGetSheetsQuery(
    { dataSourceName, dataSourceId },
    { skip: !dataSourceId }
  );
  const [setSheet, { isLoading: isSettingTheSheet }] =
    useSetSheetToDataSourceMutation();

  const handleSheetSelected = async (sheet: { id: string; name: string }) => {
    const response = await setSheet({
      dataSourceId,
      dataSourceName,
      spreadsheetId: sheet.id,
      spreadsheetName: sheet.name,
    }).unwrap();

    // If all is good we should refetch the data source and tables list.
    if (response?.ok) {
      setIsReloading(true);
      await refetchTables();
      await refetchDataSource();
      setIsReloading(false);
    }
  };

  return (
    <PageWrapper heading="Set up">
      <>
        Select a sheet to use for this data source.
        {(isLoading || isSettingTheSheet || isReloading) && <LoadingOverlay inPageWrapper />}
        {!isLoading && sheetsResponse?.ok && (
          <ul>
            <div className="grid">
              {sheetsResponse?.data?.map((sheet) => (
                <li key={sheet.id}>
                  <a
                    className="cursor-pointer"
                    onClick={() => handleSheetSelected(sheet)}
                  >
                    {sheet.name}
                  </a>
                </li>
              ))}
            </div>
          </ul>
        )}
      </>
    </PageWrapper>
  );
}

export default GoogleSheetsSetup;
