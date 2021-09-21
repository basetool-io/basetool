import { Code } from "@chakra-ui/react";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { useSession } from "next-auth/client";
import { useSidebarsVisible } from "@/hooks";
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";

function Index() {
  const [sidebarsVisible, setSidebarVisible] = useSidebarsVisible();

  useEffect(() => {
    setSidebarVisible(true);
  }, []);

  const {
    data: dataSourcesResponse,
    isLoading,
    error,
  } = useGetDataSourcesQuery();
  const [session, sessionIsLoading] = useSession();
  const [genericProjects, setGenericProjects] = useState<
    {
      name: string;
      credentials: string;
      description: string;
      isVisible: boolean;
    }[]
  >([
    {
      name: "Car rental",
      credentials: process.env.NEXT_PUBLIC_DUMMY_1_DB_CREDENTIALS as string,
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. A amet fugiat blanditiis nihil! Eaque quos, fuga dolorum tenetur beatae repellat. Culpa iste similique libero facilis sed quidem accusamus? Esse, doloribus.",
      isVisible: false,
    },
    {
      name: "CRM",
      credentials: process.env.NEXT_PUBLIC_DUMMY_2_DB_CREDENTIALS as string,
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. A amet fugiat blanditiis nihil! Eaque quos, fuga dolorum tenetur beatae repellat. Culpa iste similique libero facilis sed quidem accusamus? Esse, doloribus.",
      isVisible: false,
    },
    {
      name: "Ticketing",
      credentials: process.env.NEXT_PUBLIC_DUMMY_3_DB_CREDENTIALS as string,
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. A amet fugiat blanditiis nihil! Eaque quos, fuga dolorum tenetur beatae repellat. Culpa iste similique libero facilis sed quidem accusamus? Esse, doloribus.",
      isVisible: false,
    },
  ]);

  const hasDataSources = useMemo(
    () => dataSourcesResponse?.ok && dataSourcesResponse.data.length > 0,
    [dataSourcesResponse]
  );

  return (
    <Layout>
      <PageWrapper
        heading={`Welcome ${sessionIsLoading ? "" : session?.user?.firstName}`}
      >
        <>
          {sessionIsLoading && <LoadingOverlay inPageWrapper />}
          {sessionIsLoading || (
            <>
              {error && <div>Error: {JSON.stringify(error)}</div>}
              <div>
                <div className="text-lg">Hey there,</div>
                {hasDataSources && (
                  <div>
                    👈 You have{" "}
                    {isLoading ? "🤷‍♂️ ⏳" : dataSourcesResponse?.data?.length}{" "}
                    data sources available.
                  </div>
                )}
                {hasDataSources || (
                  <div>
                    <div className="text-md">
                      You haven't added any data sources. Add a new one by
                      clicking{" "}
                      <Link href="/data-sources/new">
                        <a className="underline text-blue-600">here</a>
                      </Link>
                      .
                    </div>
                  </div>
                )}

                <div className="text-gray-500 my-4">- OR -</div>
                <div>
                  <div className="text-md">
                    If you don't yet want to add your data source and want to
                    see how things work, use a dummy database from below to see
                    how fast you can get up and running.
                  </div>
                  <div className="divide-y mt-4">
                    {genericProjects &&
                      Object.values(genericProjects).map(
                        (
                          { name, credentials, description, isVisible },
                          idx
                        ) => {
                          return (
                            <div className="block py-4" key={idx}>
                              <span className="text-xl font-extralight">
                                {idx + 1}. {name}
                              </span>
                              {isVisible || (
                                <a
                                  className="ml-1 text-blue-600 cursor-pointer text-sm"
                                  onClick={() => {
                                    const newProjects = [...genericProjects];
                                    // toggle the isVisible property
                                    newProjects[idx].isVisible =
                                      !newProjects[idx].isVisible;
                                    setGenericProjects(newProjects);
                                  }}
                                >
                                  (show credentials)
                                </a>
                              )}
                              <div>
                                {isVisible && (
                                  <>
                                    <Code>{credentials}</Code>{" "}
                                    <Link
                                      href={`/data-sources/postgresql/new?credentials=${credentials}&name=${name}`}
                                    >
                                      <a className="ml-1 text-blue-600 cursor-pointer text-sm">
                                        (use these credentials)
                                      </a>
                                    </Link>
                                  </>
                                )}
                              </div>
                              <div className="mt-4">{description}</div>
                            </div>
                          );
                        }
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      </PageWrapper>
    </Layout>
  );
}

export default Index;
