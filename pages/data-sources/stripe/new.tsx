import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { PlusIcon } from "@heroicons/react/outline";
import { joiResolver } from "@hookform/resolvers/joi/dist/joi";
import { schema } from "@/plugins/data-sources/stripe/schema";
import { useAddDataSourceMutation } from "@/features/data-sources/api-slice";
import { useForm } from "react-hook-form";
import { useProfile } from "@/hooks";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton"
import Layout from "@/components/Layout";
import Link from "next/link"
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useState } from "react";

export interface IFormFields {
  id?: number;
  name: string;
  type: "stripe";
  organizationId: number;
  credentials: {
    secretKey: string;
  };
  options: Record<string, unknown>
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
      type: "stripe",
      organizationId:
        organizations && organizations.length > 0 ? organizations[0].id : "",
      credentials: {
        secretKey: router.query.credentials ? router.query.credentials : "",
      },
      options: {},
    },
    resolver: joiResolver(schema),
  });
  const errors = formState

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
    <Layout hideSidebar={true}>
      <PageWrapper
        heading="Add data source"
        buttons={<BackButton href="/data-sources/new" />}
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
                placeholder="My Stripe API"
                {...register("name")}
                autoFocus
              />
              <FormHelperText>The name of your Stripe API.</FormHelperText>
            </FormControl>

            <FormControl id="secretKey" isInvalid={(errors as any)?.credentials?.secretKey?.messages?.length > 0}>
              <FormLabel>Secret key</FormLabel>
              <Input
                type="string"
                placeholder="sk_live_123qwe"
                {...register("credentials.secretKey")}
              />
              <FormHelperText>
                Generate a new API key <Link href="https://dashboard.stripe.com/apikeys"><a className="underline text-blue-600" target="_blank">here</a></Link>. Scope the API key to whichever resources you want to use.
                <br />   The credentials are safely
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
            <input type="submit" className="hidden invisible" />
          </form>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default New;
