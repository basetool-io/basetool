import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { PlusIcon, TerminalIcon } from "@heroicons/react/outline";
import { isEmpty } from "lodash";
import { joiResolver } from "@hookform/resolvers/joi";
import { schema } from "@/plugins/data-sources/postgresql/schema";
import { toast } from "react-toastify";
import {
  useAddDataSourceMutation,
  useCheckConnectionMutation,
} from "@/features/data-sources/api-slice";
import { useForm } from "react-hook-form";
import { useProfile } from "@/hooks";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
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

  const { register, handleSubmit, getValues, watch } = useForm({
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

  const [checkConnection, { isLoading: isChecking }] =
    useCheckConnectionMutation();

  const checkConnectionMethod = async () => {
    const type = getValues("type");
    const credentials = getValues("credentials");
    if (!isEmpty(getValues("credentials.url"))) {
      await checkConnection({
        body: { type, credentials },
      }).unwrap();
    } else {
      toast.error(
        "Credentials are not complete. You have to input 'url' in order to test connection."
      );
    }
  };

  return (
    <Layout hideSidebar={true}>
      <PageWrapper
        heading="Add data source"
        buttons={<BackButton href="/data-sources/new" />}
        footer={
          <PageWrapper.Footer
            left={
              <Button
                colorScheme="gray"
                size="sm"
                variant="outline"
                onClick={checkConnectionMethod}
                leftIcon={<TerminalIcon className="h-4" />}
                isLoading={isChecking}
              >
                Test connection
              </Button>
            }
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
                isLoading={isLoading}
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
                The credentials are safely encrypted. We'll never show these
                credentials again.
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
              <Checkbox
                id="credentials.useSsl"
                {...register("credentials.useSsl")}
              />
            </FormControl>
            <input type="submit" className="hidden invisible" />
          </form>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default New;
