import {
  Button,
  Checkbox,
  Code,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Switch,
  useDisclosure,
} from "@chakra-ui/react";
import {
  DuplicateIcon,
  LinkIcon,
  PlusIcon,
  TerminalIcon,
} from "@heroicons/react/outline";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { SQLDataSourceTypes } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { WHITELISTED_IP_ADDRESS } from "@/lib/constants";
import { joiResolver } from "@hookform/resolvers/joi/dist/joi";
import { merge } from "lodash";
import { toast } from "react-toastify";
import {
  useAddDataSourceMutation,
  useCheckConnectionMutation,
} from "@/features/data-sources/api-slice";
import { useCopyToClipboard } from "react-use";
import { useForm } from "react-hook-form";
import { useProfile } from "@/hooks";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useEffect, useMemo, useState } from "react";
import URI from "urijs";
import getSchema from "@/plugins/data-sources/getSchema";
import isEmpty from "lodash/isEmpty";
import isUndefined from "lodash/isUndefined";

export type IFormFields = {
  id?: number;
  name: string;
  type: SQLDataSourceTypes;
  organizationId: number;
  options: {
    connectsWithSSH: boolean;
    connectsWithSSHKey: boolean;
  };
  credentials: {
    host: string;
    port: number;
    database: string;
    user: string;
    password?: string;
    useSsl: boolean;
  };
};

export type DefaultValueCredentials = {
  host?: string;
  port?: number | "";
  database?: string;
  user?: string;
  password?: string;
  useSsl?: boolean;
};

const NewDataSourceForm = ({
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
      passphrase?: string;
    };
  };
  defaultValues?: {
    name?: string;
    type?: string;
    organizationId?: string;
    options?: {
      connectsWithSSH?: boolean;
      connectsWithSSHKey?: boolean;
    };
    credentials?: DefaultValueCredentials;
    ssh?: {
      host?: string;
      port?: number | "";
      user?: string;
      password?: string;
      key?: any;
      passphrase?: string;
    };
  };
}) => {
  const router = useRouter();
  const [addDataSource, { isLoading }] = useAddDataSourceMutation();
  const { organizations } = useProfile();
  defaultValues = merge(
    {
      name: "",
      type: type,
      organizationId: "",
      options: {
        connectsWithSSH: false,
        connectsWithSSHKey: false,
      },
      credentials: {
        host: "",
        port: "",
        database: "",
        user: "",
        password: "",
        useSsl: true,
      },
      ssh: {
        port: 22,
      },
    },
    defaultValues
  );

  /**
   * Init the form
   */
  const schema = getSchema(type);
  const { register, handleSubmit, formState, setValue, getValues, watch } =
    useForm({
      defaultValues,
      resolver: joiResolver(schema),
    });
  const errors = useMemo(() => formState.errors, [formState.errors]);

  const watcher = watch();
  const formData = useMemo(() => getValues(), [watcher]);

  /**
   * Submit the form
   */
  const onSubmit = async (formData: IFormFields) => {
    let response;
    try {
      // Check the connection is successful before saving a data source.
      const connectionSuccessful = await checkConnectionMethod();
      if (connectionSuccessful) {
        response = await addDataSource({ body: formData }).unwrap();
      }
    } catch (error) {}

    if (response && response.ok) {
      await router.push(`/data-sources/${response.data.id}`);
    }
  };

  /**
   * If we get some credentials through the url params, they must be removed after use
   */
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

  /**
   * Set the first org as selected
   */
  useEffect(() => {
    if (organizations && organizations.length > 0 && organizations[0].id) {
      setValue("organizationId", organizations[0].id?.toString(), {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [organizations]);

  /**
   * Check the connection
   */
  const [checkConnection, { isLoading: isChecking }] =
    useCheckConnectionMutation();

  const checkConnectionMethod = async () => {
    const type = getValues("type");
    const credentials = getValues("credentials");
    const ssh = getValues("ssh");
    const options = getValues("options");
    let body: any = { type, credentials, options };

    // Add the SSH credentials
    if (formData?.options?.connectsWithSSH)
      body = {
        ...body,
        ssh,
      };
    if (
      !isEmpty(getValues("credentials.host")) &&
      !isEmpty(getValues("credentials.database")) &&
      !isEmpty(getValues("credentials.user"))
    ) {
      const response = await checkConnection({
        body,
      }).unwrap();
      if ((response as any).ok) return true;
    } else {
      toast.error(
        "Credentials are not complete. You have to input 'host', 'port', 'database' and 'user' in order to test connection."
      );
    }

    return false;
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [credentialsUrl, setCredentialsUrl] = useState<string | undefined>();

  const fillCredentialsFromUrl = () => {
    const uri = URI(credentialsUrl);

    const credentials = getValues("credentials") || {};
    if (uri.hostname()) credentials.host = uri.hostname();
    if (uri.port()) credentials.port = parseInt(uri.port());
    if (uri.path()) credentials.database = uri.path().replace("/", "");
    if (uri.username()) credentials.user = uri.username();
    if (uri.password()) credentials.password = uri.password();

    setValue("credentials", credentials);

    onClose();
  };

  const [state, copyToClipboard] = useCopyToClipboard();

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
            right={
              <Button
                colorScheme="blue"
                size="sm"
                variant="outline"
                onClick={onOpen}
                leftIcon={<LinkIcon className="h-4" />}
              >
                Paste from URL
              </Button>
            }
          />
        }
      >
        <div className="relative flex flex-1 w-full h-full items center justify-center">
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Paste from URL</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Input
                  type="text"
                  placeholder="postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]"
                  value={credentialsUrl}
                  onChange={(e) => setCredentialsUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isEmpty(credentialsUrl))
                      fillCredentialsFromUrl();
                  }}
                  autoFocus
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  colorScheme="gray"
                  size="sm"
                  variant="outline"
                  mr={3}
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={fillCredentialsFromUrl}
                  isDisabled={isEmpty(credentialsUrl)}
                >
                  Apply
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
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
                    type="text"
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
                    type="password"
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

            <div className="text-gray-800 text-">
              Add our IP{" "}
              <span
                className="cursor-pointer"
                onClick={() => {
                  copyToClipboard(WHITELISTED_IP_ADDRESS);
                  toast("📋 Copied to clipboard");
                }}
              >
                <Code>{WHITELISTED_IP_ADDRESS}</Code>{" "}
                <DuplicateIcon className="inline h-4" />
              </span>{" "}
              to your server's whitelist.
            </div>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="connect-with-ssh" mb="0">
                Connect with SSH
              </FormLabel>
              <Switch
                id="connect-with-ssh"
                isChecked={formData?.options?.connectsWithSSH}
                onChange={() =>
                  setValue(
                    "options",
                    {
                      ...formData?.options,
                      connectsWithSSH: !formData?.options?.connectsWithSSH,
                    },
                    {
                      shouldTouch: true,
                    }
                  )
                }
              />
            </FormControl>

            {formData?.options?.connectsWithSSH && (
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
                      <FormLabel>User</FormLabel>
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
                        disabled={formData.options.connectsWithSSHKey}
                        placeholder={placeholders?.ssh?.password}
                        {...register("ssh.password")}
                      />
                      <FormErrorMessage>
                        {errors?.ssh?.password?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </div>
                </div>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="connect-with-ssh-key" mb="0">
                    Connect using SSH key
                  </FormLabel>
                  <Switch
                    id="connect-with-key"
                    isChecked={formData?.options?.connectsWithSSHKey}
                    onChange={() =>
                      setValue(
                        "options",
                        {
                          ...formData?.options,
                          connectsWithSSHKey:
                            !formData?.options?.connectsWithSSHKey,
                        },
                        {
                          shouldTouch: true,
                        }
                      )
                    }
                  />
                </FormControl>

                {formData.options.connectsWithSSHKey && (
                  <div className="w-full flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="sm:w-1/2">
                      <FormControl
                        id="ssh-key"
                        isInvalid={!isUndefined(errors?.ssh?.key?.message)}
                      >
                        <FormLabel>SSH key</FormLabel>
                        <input type="file" {...register("ssh.key")} />
                        <FormErrorMessage>
                          {errors?.ssh?.key?.message}
                        </FormErrorMessage>
                      </FormControl>
                    </div>
                    <div className="sm:w-1/2">
                      <FormControl
                        id="passphrase"
                        isInvalid={
                          !isUndefined(errors?.ssh?.passphrase?.message)
                        }
                      >
                        <FormLabel>SSH key passphrase</FormLabel>
                        <Input
                          type="text"
                          placeholder={placeholders?.ssh?.passphrase}
                          {...register("ssh.passphrase")}
                        />
                        <FormHelperText>
                          Leave empty if the key is not encrypted.
                        </FormHelperText>
                        <FormErrorMessage>
                          {errors?.ssh?.passphrase?.message}
                        </FormErrorMessage>
                      </FormControl>
                    </div>
                  </div>
                )}
              </>
            )}
            <input type="submit" className="hidden invisible" />
          </form>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default memo(NewDataSourceForm);
