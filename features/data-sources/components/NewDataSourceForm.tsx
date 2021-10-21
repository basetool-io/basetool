import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Switch,
} from "@chakra-ui/react";
import { PlusIcon, TerminalIcon } from "@heroicons/react/outline";
import { SQLDataSourceTypes } from "@/plugins/data-sources/abstract-sql-query-service/types"
import { joiResolver } from "@hookform/resolvers/joi";
import { merge } from "lodash";
import { schema } from "@/plugins/data-sources/mysql/schema";
import { toast } from "react-toastify";
import {
  useAddDataSourceMutation,
  useCheckConnectionMutation,
} from "@/features/data-sources/api-slice";
import { useBoolean } from "react-use";
import { useForm } from "react-hook-form";
import { useProfile } from "@/hooks";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useEffect, useMemo } from "react";
import isEmpty from "lodash/isEmpty";
import isUndefined from "lodash/isUndefined";

export type IFormFields = {
  id?: number;
  name: string;
  type: SQLDataSourceTypes;
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
  type: SQLDataSourceTypes;
  placeholders?: {
    name?: string;
    type?: string;
    organizationId?: string;
    credentials?: {
      host?: string;
      port?: string;
      database?: string;
      user?: string;
      password?: string;
    };
    ssh?: {
      host?: string;
      port?: string;
      user?: string;
      password?: string;
    };
  };
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
    ssh?: {
      host?: string;
      port?: number | "";
      user?: string;
      password?: string;
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
  const router = useRouter();
  const [addDataSource, { isLoading }] = useAddDataSourceMutation();
  const { organizations } = useProfile();

  const onSubmit = async (formData: IFormFields) => {

    let response;
    try {
      response = await addDataSource({ body: formData }).unwrap();
    } catch (error) {}

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

  const [connectWithSsh, toggleConnectWithSsh] = useBoolean(false);

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
                type="text"
                placeholder={placeholders.name}
                {...register("name")}
                autoFocus
              />
              <FormHelperText>The name of your data source.</FormHelperText>
              <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
            </FormControl>

            <div className="w-full flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="sm:w-3/4">
                <FormControl
                  id="host"
                  isInvalid={!isUndefined(errors?.credentials?.host?.message)}
                >
                  <FormLabel>Host</FormLabel>
                  <Input
                    type="text"
                    placeholder={placeholders?.credentials?.host}
                    {...register("credentials.host")}
                  />
                  <FormErrorMessage>
                    {errors?.credentials?.host?.message}
                  </FormErrorMessage>
                </FormControl>
              </div>
              <div className="flex-1">
                <FormControl
                  id="port"
                  isInvalid={!isUndefined(errors?.credentials?.port?.message)}
                >
                  <FormLabel>Port</FormLabel>
                  <Input
                    type="password"
                    placeholder={placeholders?.credentials?.port}
                    {...register("credentials.port")}
                  />
                  <FormErrorMessage>
                    {errors?.credentials?.port?.message}
                  </FormErrorMessage>
                </FormControl>
              </div>
            </div>

            <FormControl
              id="database"
              isInvalid={!isUndefined(errors?.credentials?.database?.message)}
            >
              <FormLabel>Database name</FormLabel>
              <Input
                type="text"
                placeholder={placeholders?.credentials?.database}
                {...register("credentials.database")}
              />
              <FormErrorMessage>
                {errors?.credentials?.database?.message}
              </FormErrorMessage>
            </FormControl>

            <div className="w-full flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="sm:w-1/2">
                <FormControl
                  id="user"
                  isInvalid={!isUndefined(errors?.credentials?.user?.message)}
                >
                  <FormLabel>Username</FormLabel>
                  <Input
                    type="text"
                    placeholder={placeholders?.credentials?.user}
                    {...register("credentials.user")}
                  />
                  <FormErrorMessage>
                    {errors?.credentials?.user?.message}
                  </FormErrorMessage>
                </FormControl>
              </div>

              <div className="sm:w-1/2">
                <FormControl
                  id="password"
                  isInvalid={
                    !isUndefined(errors?.credentials?.password?.message)
                  }
                >
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="text"
                    placeholder={placeholders?.credentials?.password}
                    {...register("credentials.password")}
                  />
                  <FormErrorMessage>
                    {errors?.credentials?.password?.message}
                  </FormErrorMessage>
                </FormControl>
              </div>
            </div>

            <div className="text-gray-600 text-sm">
              The credentials are safely encrypted. We'll never display these
              credentials ever again.
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

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="email-alerts" mb="0">
                Connect with SSH
              </FormLabel>
              <Switch
                id="email-alerts"
                isChecked={connectWithSsh}
                onChange={() => toggleConnectWithSsh()}
              />
            </FormControl>

            {connectWithSsh && (
              <>
                <div className="font-xl font-bold">SSH connection details</div>

                <div className="w-full flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="sm:w-3/4">
                    <FormControl
                      id="host"
                      isInvalid={!isUndefined(errors?.ssh?.host?.message)}
                    >
                      <FormLabel>Host</FormLabel>
                      <Input
                        type="text"
                        placeholder={placeholders?.ssh?.host}
                        {...register("ssh.host")}
                      />
                      <FormErrorMessage>
                        {errors?.ssh?.host?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </div>
                  <div className="flex-1">
                    <FormControl
                      id="port"
                      isInvalid={!isUndefined(errors?.ssh?.port?.message)}
                    >
                      <FormLabel>Port</FormLabel>
                      <Input
                        type="number"
                        placeholder={placeholders?.ssh?.port}
                        {...register("ssh.port")}
                      />
                      <FormErrorMessage>
                        {errors?.ssh?.port?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </div>
                </div>

                <div className="w-full flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="sm:w-1/2">
                    <FormControl
                      id="user"
                      isInvalid={!isUndefined(errors?.ssh?.user?.message)}
                    >
                      <FormLabel>Username</FormLabel>
                      <Input
                        type="text"
                        placeholder={placeholders?.ssh?.user}
                        {...register("ssh.user")}
                      />
                      <FormErrorMessage>
                        {errors?.ssh?.user?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </div>

                  <div className="sm:w-1/2">
                    <FormControl
                      id="password"
                      isInvalid={!isUndefined(errors?.ssh?.password?.message)}
                    >
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        placeholder={placeholders?.ssh?.password}
                        {...register("ssh.password")}
                      />
                      <FormErrorMessage>
                        {errors?.ssh?.password?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </div>
                </div>
              </>
            )}

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