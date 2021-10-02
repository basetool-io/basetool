import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { PlusIcon } from "@heroicons/react/outline";
import { joiResolver } from "@hookform/resolvers/joi";
import { schema } from "@/plugins/data-sources/postgresql/schema";
import { useAddDataSourceMutation } from "@/features/data-sources/api-slice";
import { useForm } from "react-hook-form";
import { useProfile } from "@/hooks";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useState } from "react";
export interface IFormFields {
  id?: number;
  name: string;
  type: "postgresql";
  organizationId: number;
  credentials: {
    url: string;
    useSsl: boolean;
  };
}

function New() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [addDataSource] = useAddDataSourceMutation();
  const { organizations } = useProfile();

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
      await router.push(`/data-sources/${response.data.id}`);
    }
  };

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      name: router.query.name || "",
      type: "postgresql",
      organizationId:
        organizations && organizations.length > 0 ? organizations[0].id : "",
      credentials: {
        url: router.query.credentials ? router.query.credentials : "",
        useSsl: true,
      },
    },
    resolver: joiResolver(schema),
  });

  useEffect(() => {
    if (router.query.credentials) {
      // reset the URL if we get the credentials through the params for added security
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
      <PageWrapper
        heading="Add data source"
        footer={
          <PageWrapper.Footer
            center={
              <Button
                colorScheme="blue"
                size="sm"
                width="300px"
                type="submit"
                disabled={isLoading}
                onClick={(e) => {
                  return handleSubmit(onSubmit)(e);
                }}
                leftIcon={<PlusIcon className="h-4" />}
              >
                Create
              </Button>
            }
          />
        }
      >
        <div className="relative flex flex-col flex-1 w-full h-full">
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
              <FormHelperText>
                The URL of your Postgres DB. The credentials are safely
                encrypted. We'll never show these credentials again.
              </FormHelperText>
            </FormControl>

            <FormControl id="organization">
              <FormLabel>Organization</FormLabel>
              <Select {...register("organizationId")}>
                {organizations.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl id="credentials_useSsl">
              <FormLabel htmlFor="credentials.useSsl">Use SSL</FormLabel>
              <Checkbox id="credentials.useSsl" {...register("credentials.useSsl")} />
            </FormControl>
            <input type="submit" className="hidden invisible" />
          </form>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default New;
