import { ArrowRightIcon } from "@heroicons/react/outline";
import { Button } from "@chakra-ui/react";
import { availableDataSources } from "@/plugins/data-sources";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function New() {
  const router = useRouter();

  const next = () => {
    console.log("next->");
  };
  const selectDataSource = async (id: string) => {
    await router.push({
      pathname: router.pathname,
      query: {
        type: id,
      },
    });
  };

  return (
    <Layout>
      <PageWrapper
        heading="Select data source type"
        footer={
          <PageWrapper.Footer
            center={
              <Button
                type="submit"
                colorScheme="blue"
                size="sm"
                width="300px"
                onClick={() => next()}
              >
                Next <ArrowRightIcon className="h-4" />
              </Button>
            }
          />
        }
      >
        <div className="flex justify-center">
          <div className="max-w-3xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {availableDataSources.map(({ id, label, beta, comingSoon }) => (
                <a
                  key={id}
                  className="relative block border shadow-md px-12 py-8 rounded text-center overflow-hidden cursor-pointer bg-gradient-to-b from-white to-gray-100 hover:to-blue-gray-200"
                  onClick={() => !comingSoon && selectDataSource(id)}
                >
                  {beta && (
                    <div className="absolute text-center top-0 right-0 m-0 -mt-4 -mr-14 transform rotate-45 uppercase font-bold text-white py-2 pt-8 px-12 bg-green-400">
                      Beta
                    </div>
                  )}
                  {comingSoon && (
                    <div className="absolute text-center top-auto bottom-0 right-0 uppercase font-bold text-sm text-white py-1 w-full bg-blue-400">
                      Coming soon
                    </div>
                  )}
                  <div className="mb-4">
                    <input
                      type="radio"
                      className="w-5 h-5"
                      checked={!comingSoon && router.query.type === id}
                      disabled={comingSoon}
                    />
                  </div>
                  <div className="relative h-12 mb-4">
                    <Image
                      src={`/img/logos/${id}.png`}
                      alt={`New ${id} data-source`}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default New;
