import {
  useGetSheetsQuery,
  useSetSheetToDataSourceMutation,
} from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function Setup() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const dataSourceName = "google-sheets";
  const { data: sheetsResponse, isLoading } = useGetSheetsQuery(
    { dataSourceName, dataSourceId },
    { skip: !dataSourceId }
  );
  const [setSheet, { isLoading: settingSheet }] =
    useSetSheetToDataSourceMutation();

  const handleSheetSelected = async (sheet: { id: string; name: string }) => {
    const response = await setSheet({
      dataSourceId,
      dataSourceName,
      spreadsheetId: sheet.id,
      spreadsheetName: sheet.name,
    }).unwrap();

    if (response?.ok) {
      await router.push(`/data-sources/${dataSourceId}`);
    }
  };

  return (
    <Layout>
      <PageWrapper heading="Set up">
        <>
          Select a sheet to use for this data source.
          {isLoading || (settingSheet && <LoadingOverlay inPageWrapper />)}
          {!isLoading && sheetsResponse?.ok && (
            <ul>
              <div className="grid">
                {sheetsResponse?.data?.map((sheet) => (
                  <li>
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
    </Layout>
  );
}

export default Setup;
