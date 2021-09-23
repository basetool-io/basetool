import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { availableDataSources } from "@/plugins/data-sources";
import { joiResolver } from "@hookform/resolvers/joi";
import { schema } from "@/plugins/data-sources/postgresql/schema";
import {
  useAddDataSourceMutation,
} from "@/features/data-sources/api-slice";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useState } from "react";
export interface IFormFields {
  id?: number;
  name: string;
  type: "postgresql";
  credentials: {
    url: string;
    useSsl: boolean;
  };
}

function New() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [addDataSource] = useAddDataSourceMutation();

  const onSubmit = async (formData: IFormFields) => {
    setIsLoading(true);

    let response;
    try {
        response = await addDataSource({ body: formData }).unwrap();
    } catch (error) {
      setIsLoading(false);
    }

    setIsLoading(false);

    if (response && response.ok) {
      router.push(`/data-sources/${response.data.id}`);
    }
  };

  const { register, handleSubmit, setValue } = useForm({
    resolver: joiResolver(schema),
  });

  useEffect(() => {
    if (router.query.credentials) {
      // If we get the credentials in a params, set it in the form
      setValue("name", router.query.name as string);
      setValue("credentials.url", router.query.credentials as string);
      // reset the URL for added security
      router.push(
        {
          pathname: router.pathname,
        },
        router.pathname,
        {
          shallow: true,
        }
      );
    }
  }, []);

  return (
    <Layout>
      <PageWrapper heading="Add data source">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormControl id="name">
            <FormLabel>Name</FormLabel>
            <Input
              type="string"
              placeholder="My Postgres DB"
              {...register("name")}
            />
            <FormHelperText>The name of your data source.</FormHelperText>
          </FormControl>

          <FormControl id="url">
            <FormLabel>URL</FormLabel>
            <Input
              type="string"
              placeholder="postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1]"
              {...register("credentials.url")}
            />
            <FormHelperText>The URL of your Postgres DB.</FormHelperText>
          </FormControl>

          <FormControl id="type">
            <FormLabel>Data source type</FormLabel>
            <Select {...register("type")}>
              <option disabled>Select data source</option>
              {availableDataSources.map(({ id, label, enabled }) => (
                <option key={id} value={id} disabled={!enabled}>
                  {label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl id="credentials_useSsl">
            <FormLabel>Use SSL</FormLabel>
            <Checkbox {...register("credentials.useSsl")} defaultIsChecked />
          </FormControl>
          <input type="submit" className="hidden invisible" />
          <Button className="mt-4" type="submit" disabled={isLoading}>
            Create
          </Button>
        </form>
      </PageWrapper>
    </Layout>
  );
}

export default New;
