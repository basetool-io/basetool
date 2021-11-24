import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/outline";
import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { DataSource } from "@prisma/client";
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { isNumber, isUndefined } from "lodash";
import { joiResolver } from "@hookform/resolvers/joi/dist/joi";
import { schema } from "@/features/views/schema";
import { useAddViewMutation } from "@/features/views/api-slice";
import { useDataSourceContext } from "@/hooks";
import { useForm } from "react-hook-form";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useState } from "react";
import Shimmer from "@/components/Shimmer";

export interface IFormFields {
  id?: number;
  name: string;
  public: boolean;
  dataSourceId: number;
  tableName: string;
}

function New() {
  const router = useRouter();
  const { dataSourceId, tableName } = useDataSourceContext();

  const { register, handleSubmit, formState, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      public: true,
      dataSourceId: parseInt(dataSourceId),
      tableName: tableName,
    },
    resolver: joiResolver(schema),
  });

  useEffect(() => {
    if (dataSourceId)
      setValue("dataSourceId", parseInt(dataSourceId), {
        shouldDirty: true,
        shouldTouch: true,
      });

    if (tableName)
      setValue("tableName", tableName, {
        shouldDirty: true,
        shouldTouch: true,
      });
  }, [dataSourceId, tableName]);

  const watchDataSourceId = watch("dataSourceId");

  const { errors } = formState;

  const { data: dataSourcesResponse, isLoading: dataSourcesAreLoading } =
    useGetDataSourcesQuery();

  const { data: tablesResponse, isLoading: tablesAreLoading } =
    useGetTablesQuery(
      { dataSourceId: watchDataSourceId.toString() },
      { skip: !isNumber(watchDataSourceId) }
    );

  const [addView, { isLoading: formIsLoading }] = useAddViewMutation();
  const onSubmit = async (formData: IFormFields) => {
    const response = await addView({ body: formData }).unwrap();

    if (response && response.ok) {
      await router.push(`/views/${response.data.id}/edit`);
    }
  };

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: "Step 1",
      name: "Name your view",
      button: "Select linked data",
    },
    {
      id: "Step 2",
      name: "Link data source",
      button: "Select sharing options",
    },
    {
      id: "Step 3",
      name: "Sharing & permissions",
      button: "Create view 👌",
    },
  ];

  // Switch to the page with errors.
  useEffect(() => {
    if (!isUndefined(errors?.name?.message)) {
      setCurrentStep(0);
    } else if (
      !isUndefined(errors?.tableName?.message) ||
      !isUndefined(errors?.dataSourceId?.message)
    ) {
      setCurrentStep(1);
    } else if (!isUndefined(errors?.public?.message)) {
      setCurrentStep(2);
    }
  }, [errors]);

  return (
    <Layout>
      <PageWrapper
        heading="Create view"
        flush={true}
        footer={
          <PageWrapper.Footer
            left={
              currentStep > 0 && (
                <Button
                  as="a"
                  colorScheme="gray"
                  size="sm"
                  leftIcon={<ArrowLeftIcon className="h-4" />}
                  onClick={(e) => setCurrentStep(currentStep - 1)}
                >
                  Previous step
                </Button>
              )
            }
            center={
              <Button
                as="a"
                colorScheme={currentStep < 2 ? "blue" : "green"}
                size="sm"
                width={{ lg: "300px" }}
                onClick={(e) => {
                  return currentStep < 2
                    ? setCurrentStep(currentStep + 1)
                    : handleSubmit(onSubmit)(e);
                }}
                disabled={formIsLoading}
                isLoading={formIsLoading}
                rightIcon={<ArrowRightIcon className="h-4" />}
              >
                {steps[currentStep].button}
              </Button>
            }
          />
        }
      >
        <div className="mt-2 px-4">
          <nav aria-label="Progress">
            <ol
              role="list"
              className="space-y-4 md:flex md:space-y-0 md:space-x-8"
            >
              {steps.map((step, idx: number) => (
                <li key={step.name} className="md:flex-1 cursor-pointer">
                  {idx < currentStep ? (
                    <a
                      onClick={() => {
                        setCurrentStep(idx);
                      }}
                      className="group pl-4 py-2 flex flex-col border-l-4 border-blue-600 hover:border-cool-gray-800 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                    >
                      <span className="text-xs text-blue-600 font-semibold tracking-wide uppercase group-hover:text-cool-gray-800">
                        {step.id}
                      </span>
                      <span className="text-sm font-medium">{step.name}</span>
                    </a>
                  ) : idx === currentStep ? (
                    <a
                      onClick={() => {
                        setCurrentStep(idx);
                      }}
                      className="pl-4 py-2 flex flex-col border-l-4 border-blue-600 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                      aria-current="step"
                    >
                      <span className="text-xs text-blue-600 font-semibold tracking-wide uppercase">
                        {step.id}
                      </span>
                      <span className="text-sm font-medium">{step.name}</span>
                    </a>
                  ) : (
                    <a
                      onClick={() => {
                        setCurrentStep(idx);
                      }}
                      className="group pl-4 py-2 flex flex-col border-l-4 border-gray-200 hover:border-gray-300 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                    >
                      <span className="text-xs text-gray-500 font-semibold tracking-wide uppercase group-hover:text-gray-700">
                        {step.id}
                      </span>
                      <span className="text-sm font-medium">{step.name}</span>
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <div className="py-2 flex flex-col justify-center align-middle w-full h-full px-40">
            <form onSubmit={handleSubmit(onSubmit)} className="my-0 space-y-4">
              {currentStep === 0 && (
                <FormControl
                  id="name"
                  isInvalid={!isUndefined(errors?.name?.message)}
                >
                  <FormLabel>Add name</FormLabel>
                  <Input
                    type="string"
                    placeholder="Active users"
                    {...register("name")}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setCurrentStep(1);
                      }
                    }}
                  />
                  <FormHelperText>The name of your view.</FormHelperText>
                  <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
                </FormControl>
              )}

              {currentStep === 1 && (
                <>
                  <FormControl
                    id="dataSourceId"
                    isInvalid={!isUndefined(errors?.dataSourceId?.message)}
                  >
                    <FormLabel>Select datasource</FormLabel>
                    {dataSourcesAreLoading && (
                      <Shimmer width={450} height={40} />
                    )}
                    {dataSourcesAreLoading || (
                      <Select {...register("dataSourceId")}>
                        {dataSourcesResponse?.ok &&
                          dataSourcesResponse?.data.map(
                            (dataSource: DataSource) => (
                              <option key={dataSource.id} value={dataSource.id}>
                                {dataSource.name}
                              </option>
                            )
                          )}
                      </Select>
                    )}
                    <FormErrorMessage>
                      {errors?.dataSourceId?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    id="tableName"
                    isInvalid={!isUndefined(errors?.tableName?.message)}
                  >
                    <FormLabel>Select table</FormLabel>
                    {tablesAreLoading && <Shimmer width={450} height={40} />}
                    {tablesAreLoading || (
                      <Select
                        placeholder="Select a table"
                        {...register("tableName")}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            setCurrentStep(2);
                          }
                        }}
                      >
                        {tablesResponse?.ok &&
                          tablesResponse?.data.map(
                            (table: ListTable, idx: number) => (
                              <option key={idx} value={table.name}>
                                {table.name}
                              </option>
                            )
                          )}
                      </Select>
                    )}
                    <FormHelperText>
                      The table you're linking to.
                    </FormHelperText>
                    <FormErrorMessage>
                      {errors?.tableName?.message}
                    </FormErrorMessage>
                  </FormControl>
                </>
              )}
              {currentStep === 2 && (
                <FormControl
                  id="public"
                  isInvalid={!isUndefined(errors?.public?.message)}
                >
                  <FormLabel>Public</FormLabel>
                  <Checkbox
                    size="lg"
                    colorScheme="gray"
                    {...register("public")}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit(onSubmit)(e);
                      }
                    }}
                  />
                  <FormHelperText>
                    Will this view be visible to everyone?.
                  </FormHelperText>
                  <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
                </FormControl>
              )}
            </form>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default New;
