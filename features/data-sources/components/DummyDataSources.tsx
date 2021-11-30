import { Code } from "@chakra-ui/react";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";

type DummyProject = {
  name: string;
  credentials: string;
  description: string;
  isVisible: boolean;
};

const DummyDataSources = () => {
  const [dummyProjects, setDummyProjects] = useState<DummyProject[]>([]);

  useEffect(() => {
    const projects = [];
    if (process.env.NEXT_PUBLIC_DUMMY_1_DB_CREDENTIALS) {
      projects.push({
        name: "Electric car rental app",
        credentials: process.env.NEXT_PUBLIC_DUMMY_1_DB_CREDENTIALS as string,
        description:
          "Lorem ipsum, dolor sit amet consectetur adipisicing elit. A amet fugiat blanditiis nihil! Eaque quos, fuga dolorum tenetur beatae repellat. Culpa iste similique libero facilis sed quidem accusamus? Esse, doloribus.",
        isVisible: false,
      });
    }
    if (process.env.NEXT_PUBLIC_DUMMY_2_DB_CREDENTIALS) {
      projects.push({
        name: "Basic CRM",
        credentials: process.env.NEXT_PUBLIC_DUMMY_2_DB_CREDENTIALS as string,
        description:
          "Lorem ipsum, dolor sit amet consectetur adipisicing elit. A amet fugiat blanditiis nihil! Eaque quos, fuga dolorum tenetur beatae repellat. Culpa iste similique libero facilis sed quidem accusamus? Esse, doloribus.",
        isVisible: false,
      });
    }
    if (process.env.NEXT_PUBLIC_DUMMY_3_DB_CREDENTIALS) {
      projects.push({
        name: "Ticketing System",
        credentials: process.env.NEXT_PUBLIC_DUMMY_3_DB_CREDENTIALS as string,
        description:
          "Lorem ipsum, dolor sit amet consectetur adipisicing elit. A amet fugiat blanditiis nihil! Eaque quos, fuga dolorum tenetur beatae repellat. Culpa iste similique libero facilis sed quidem accusamus? Esse, doloribus.",
        isVisible: false,
      });
    }

    setDummyProjects(projects);
  }, []);

  const hasGenericProjects = useMemo(
    () => dummyProjects.length > 0,
    [dummyProjects]
  );
  if (!hasGenericProjects) return null;

  return (
    <PageWrapper.Section>
      <PageWrapper.Heading>Test databases</PageWrapper.Heading>
      <div className="text-md">
        If you don't yet want to add your data source at the moment but want to
        test how things work, use a dummy database from below to see how fast you can get
        up and running.
      </div>
      <div className="divide-y">
        {dummyProjects &&
          Object.values(dummyProjects).map(
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
                        const newProjects = [...dummyProjects];
                        // toggle the isVisible property
                        newProjects[idx].isVisible =
                          !newProjects[idx].isVisible;
                        setDummyProjects(newProjects);
                      }}
                    >
                      (show credentials)
                    </a>
                  )}
                  <div>
                    {isVisible && (
                      <>
                        <Link
                          href={`/data-sources/postgresql/new?credentials=${credentials}&name=${name}`}
                        >
                          <a className="ml-1 text-blue-600 cursor-pointer text-sm">
                            <Code>{credentials}</Code> (use these credentials)
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
  );
};

export default DummyDataSources;
