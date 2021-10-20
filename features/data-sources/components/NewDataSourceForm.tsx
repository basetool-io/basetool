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
import { PlusIcon, TerminalIcon } from "@heroicons/react/outline";
import { joiResolver } from "@hookform/resolvers/joi";
import { merge } from "lodash";
import { schema } from "@/plugins/data-sources/mysql/schema";
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
import React, { memo, useEffect, useMemo, useState } from "react";
import isEmpty from "lodash/isEmpty";
import isUndefined from "lodash/isUndefined";

export type SQLDataSourceId = "mysql" | "postgresql" | "maria_db" | "mssql";

export type IFormFields = {
  id?: number;
  name: string;
  type: SQLDataSourceId;
  organizationId: number;
  credentials: {
    host: string;
    port: number;
    database: string;
    user: string;
    password?: string;
    useSsl: boolean;
  };
};

function NewDataSourceForm({
  type,
  placeholders = {},
  defaultValues = {},
}: {
  type: SQLDataSourceId;
  placeholders?: Record<string, string>;
  defaultValues?: {
    name?: string;
    type?: string;
    organizationId?: string;
    credentials?: {
      host?: string;
      port?: number | "";
      database?: string;
      user?: string;
      password?: string;
      useSsl?: boolean;
    };
  };
}) {
  defaultValues = merge(
    {
      name: "",
      type: type,
      organizationId: "",
      credentials: {
        host: "",
        port: "",
        database: "",
        user: "",
        password: "",
        useSsl: true,
      },
    },
    defaultValues
  );
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

  const { register, handleSubmit, formState, setValue, getValues } = useForm({
    defaultValues,
    resolver: joiResolver(schema),
  });

  const errors = useMemo(() => formState.errors, [formState.errors]);

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

  useEffect(() => {
    if (organizations && organizations.length > 0 && organizations[0].id) {
      setValue("organizationId", organizations[0].id?.toString(), {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [organizations]);

  const [checkConnection, { isLoading: isChecking }] =
    useCheckConnectionMutation();

  const checkConnectionMethod = async () => {
    const type = getValues("type");
    const credentials = getValues("credentials");
    if (
      !isEmpty(getValues("credentials.host")) &&
      !isEmpty(getValues("credentials.database")) &&
      !isEmpty(getValues("credentials.user"))
    ) {
      await checkConnection({
        body: { type, credentials },
      }).unwrap();
    } else {
      toast.error(
        "Credentials are not complete. You have to input 'host', 'port', 'database' and 'user' in order to test connection."
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
                colorScheme="blue"
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
        <div className="relative flex flex-1 w-full h-full items center justify-center">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 max-w-2xl"
          >
            <FormControl
              id="name"
              isInvalid={!isUndefined(errors?.name?.message)}
            >
              <FormLabel>Name</FormLabel>
              <Input
                type="string"
                placeholder={placeholders.name}
                {...register("name")}
                autoFocus
              />
              <FormHelperText>The name of your data source.</FormHelperText>
              <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl
              id="host"
              isInvalid={!isUndefined(errors?.credentials?.host?.message)}
            >
              <FormLabel>Host</FormLabel>
              <Input
                type="string"
                placeholder={placeholders.host}
                {...register("credentials.host")}
              />
              <FormErrorMessage>
                {errors?.credentials?.host?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              id="port"
              isInvalid={!isUndefined(errors?.credentials?.port?.message)}
            >
              <FormLabel>Port</FormLabel>
              <Input
                type="number"
                placeholder={placeholders.port}
                {...register("credentials.port")}
              />
              <FormErrorMessage>
                {errors?.credentials?.port?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              id="database"
              isInvalid={!isUndefined(errors?.credentials?.database?.message)}
            >
              <FormLabel>Database name</FormLabel>
              <Input
                type="string"
                placeholder={placeholders.database}
                {...register("credentials.database")}
              />
              <FormErrorMessage>
                {errors?.credentials?.database?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              id="user"
              isInvalid={!isUndefined(errors?.credentials?.user?.message)}
            >
              <FormLabel>Username</FormLabel>
              <Input
                type="string"
                placeholder={placeholders.user}
                {...register("credentials.user")}
              />
              <FormErrorMessage>
                {errors?.credentials?.user?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              id="password"
              isInvalid={!isUndefined(errors?.credentials?.password?.message)}
            >
              <FormLabel>Password</FormLabel>
              <Input
                type="string"
                placeholder={placeholders.password}
                {...register("credentials.password")}
              />
              <FormErrorMessage>
                {errors?.credentials?.password?.message}
              </FormErrorMessage>
            </FormControl>

            <div>
              The credentials are safely encrypted. We'll never show these
              credentials again.
            </div>

            <FormControl id="credentials_useSsl">
              <FormLabel htmlFor="credentials.useSsl">Use SSL</FormLabel>
              <Checkbox
                id="credentials.useSsl"
                {...register("credentials.useSsl")}
              />
              <FormErrorMessage>
                {errors?.credentials?.useSsl?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              id="organization"
              isInvalid={!isUndefined(errors?.organizationId?.message)}
            >
              <FormLabel>Organization</FormLabel>
              <Select {...register("organizationId")}>
                {organizations.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {errors?.organizationId?.message}
              </FormErrorMessage>
            </FormControl>
            <input type="submit" className="hidden invisible" />
          </form>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default memo(NewDataSourceForm);
