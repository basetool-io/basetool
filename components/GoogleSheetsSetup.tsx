import {
  useGetDataSourceQuery,
  useGetSheetsQuery,
  useGetTablesQuery,
  useSetSheetToDataSourceMutation,
} from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import Image from "next/image";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useState } from "react";

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
    <PageWrapper heading="Select a sheet to use for this data source.">
      <>
        <span className="text-lg mb-4">
          You have multiple sheets in your account. Select the sheet that you
          want to use for this data source.{" "}
        </span>
        {(isLoading || isSettingTheSheet || isReloading) && (
          <LoadingOverlay inPageWrapper />
        )}
        {!isLoading && sheetsResponse?.ok && (
          <ul>
            <div className="grid">
              {sheetsResponse?.data?.map(
                (sheet: { id: string; name: string }) => (
                  <li key={sheet.id}>
                    <a
                      className="inline-flex cursor-pointer hover:underline"
                      onClick={() => handleSheetSelected(sheet)}
                    >
                      <div className="relative flex-shrink-0 h-5 w-4 mr-2">
                        <Image
                          src={`/img/logos/google-sheets.png`}
                          alt={sheet.name}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                      {sheet.name}
                    </a>
                  </li>
                )
              )}
            </div>
          </ul>
        )}
      </>
    </PageWrapper>
  );
}

export default memo(GoogleSheetsSetup);
