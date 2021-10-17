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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/outline";
import { DataSource } from "@prisma/client";
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { isUndefined } from "lodash";
import { joiResolver } from "@hookform/resolvers/joi";
import { schema } from "@/plugins/views/schema";
import { useAddViewMutation } from "@/features/views/api-slice";
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
  const dataSourceId = router.query.dataSourceId as string;

  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues: {
      name: "",
      public: true,
      dataSourceId: parseInt(dataSourceId),
      tableName: "",
    },
    resolver: joiResolver(schema),
  });

  useEffect(() => {
    setValue("dataSourceId", parseInt(dataSourceId), {
      shouldDirty: true,
      shouldTouch: true,
    })
  }, [dataSourceId])

  const { errors } = formState;

  const { data: dataSourcesResponse, isLoading: dataSourcesAreLoading } =
    useGetDataSourcesQuery();

  const { data: tablesResponse, isLoading: tablesAreLoading } =
    useGetTablesQuery(
      { dataSourceId },
      {
        skip: !dataSourceId,
      }
    );

  const [addView] = useAddViewMutation();
  const [formIsLoading, setFormIsLoading] = useState(false);
  const onSubmit = async (formData: IFormFields) => {
    setFormIsLoading(true);

    let response;
    try {
      response = await addView({ dataSourceId, body: formData }).unwrap();
    } catch (error) {
      setFormIsLoading(false);
    }

    setFormIsLoading(false);

    if (response && response.ok) {
      await router.push(
        `/data-sources/${dataSourceId}/views/${response.data.id}`
      );
    }
  };

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { index: 0, id: "Step 1", name: "Add name" },
    { index: 1, id: "Step 2", name: "Select data" },
    { index: 2, id: "Step 3", name: "Sharing" },
  ];

  // Switch to the page with errors.
  useEffect(() => {
    if (!isUndefined(errors?.name?.message)) {
      setCurrentStep(0);
    } else if (!isUndefined(errors?.tableName?.message) || !isUndefined(errors?.dataSourceId?.message)) {
      setCurrentStep(1);
    } else if (!isUndefined(errors?.public?.message)) {
      setCurrentStep(2);
    }
  }, [errors])

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
                  leftIcon={<ChevronLeftIcon className="h-4" />}
                  onClick={(e) => setCurrentStep(currentStep - 1)}
                >
                  Prev
                </Button>
              )
            }
            center={
              currentStep === 2 && (
                <Button
                  as="a"
                  colorScheme="green"
                  size="sm"
                  width="300px"
                  rightIcon={<PlusIcon className="h-4" />}
                  onClick={(e) => {
                    return handleSubmit(onSubmit)(e);
                  }}
                  disabled={formIsLoading}
                  isLoading={formIsLoading}
                >
                  Finish
                </Button>
              )
            }
            right={
              currentStep < 2 && (
                <Button
                  as="a"
                  colorScheme="blue"
                  size="sm"
                  rightIcon={<ChevronRightIcon className="h-4" />}
                  onClick={(e) => setCurrentStep(currentStep + 1)}
                >
                  Next
                </Button>
              )
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
              {steps.map((step) => (
                <li key={step.name} className="md:flex-1 cursor-pointer">
                  {step.index < currentStep ? (
                    <a
                      onClick={() => {
                        setCurrentStep(step.index);
                      }}
                      className="group pl-4 py-2 flex flex-col border-l-4 border-blue-600 hover:border-cool-gray-800 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                    >
                      <span className="text-xs text-blue-600 font-semibold tracking-wide uppercase group-hover:text-cool-gray-800">
                        {step.id}
                      </span>
                      <span className="text-sm font-medium">{step.name}</span>
                    </a>
                  ) : step.index === currentStep ? (
                    <a
                      onClick={() => {
                        setCurrentStep(step.index);
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
                        setCurrentStep(step.index);
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
            <form className="my-0 space-y-2">
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
                    isDisabled={true}
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
                    <FormLabel>Select table name</FormLabel>
                    {tablesAreLoading && <Shimmer width={450} height={40} />}
                    {tablesAreLoading || (
                      <Select {...register("tableName")}>
                        {tablesResponse?.ok &&
                          tablesResponse?.data.map(
                            (table: ListTable, idx: number) => (
                              <option key={idx} value={table.name}>
                                {table.label ? table.label : table.name}
                              </option>
                            )
                          )}
                      </Select>
                    )}
                    <FormHelperText>Name of the cloned table.</FormHelperText>
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
