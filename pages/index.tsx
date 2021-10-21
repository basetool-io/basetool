import { Code } from "@chakra-ui/react";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { useProfile } from "@/hooks";
import DataSourcesBlock from "@/features/data-sources/components/DataSourcesBlock";
import Layout from "@/components/Layout";
import Link from "next/link";
import OrganizationsBlock from "@/features/organizations/components/OrganizationsBlock";
import PageWrapper from "@/components/PageWrapper";
import React, { useMemo, useState } from "react";

function Index() {
  const { user, isLoading: profileIsLoading } = useProfile();

  const { data: dataSourcesResponse } = useGetDataSourcesQuery(undefined, {
    skip: !user.email,
  });
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
    <Layout hideSidebar={true}>
      <PageWrapper
        heading={`Welcome ${profileIsLoading ? "" : user?.firstName}`}
      >
        <>
          <DataSourcesBlock />
          <OrganizationsBlock />

          <PageWrapper.Section>
            <PageWrapper.Heading>Test databases</PageWrapper.Heading>
            <div className="text-md">
              If you don't yet want to add your data source at the moment but
              want to test how things work, use a dummy database to see how fast
              you can get up and running.
            </div>
            <div className="divide-y mt-4">
              {genericProjects &&
                Object.values(genericProjects).map(
                  ({ name, credentials, description, isVisible }, idx) => {
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
                        {/* <div className="mt-4">{description}</div> */}
                      </div>
                    );
                  }
                )}
            </div>
          </PageWrapper.Section>
        </>
      </PageWrapper>
    </Layout>
  );
}

export default Index;
