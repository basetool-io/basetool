import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { COOKIES_FROM_TOOL_NEW } from "@/lib/constants";
import { getBrowserTimezone } from "@/lib/time";
import { getCsrfToken, useSession } from "next-auth/client";
import { isEmpty } from "lodash";
import { joiResolver } from "@hookform/resolvers/joi/dist/joi";
import { schema } from "@/features/auth/signupSchema";
import { useApi } from "@/hooks";
import { useCookie } from "react-use";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import AuthLayout from "@/components/AuthLayout";
import HeadSection from "@/components/HeadSection";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export interface FormFields {
  csrfToken: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  organization: string;
}

const useCsrfToken = () => {
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const setTheToken = async () => {
      const token = (await getCsrfToken()) as string;
      setCsrfToken(token);
    };
    if (csrfToken === "") {
      setTheToken();
    }
  }, []);

  return csrfToken;
};

function Register() {
  const api = useApi();
  const router = useRouter();
  const [session] = useSession();
  const csrfToken = useCsrfToken();
  const [isLoading, setIsLoading] = useState(false);
  const [_, updateCookie] = useCookie(COOKIES_FROM_TOOL_NEW);

  useEffect(() => {
    if (session) router.push("/");
  }, [session]);

  useEffect(() => {
    if (router?.query?.from === "tool.new") {
      updateCookie("1");
    }
  }, [router]);

  const onSubmit = async (formData: FormFields) => {
    const response = await api.createUser({
      ...formData,
      lastKnownTimezone: getBrowserTimezone(),
    });
    setIsLoading(true);

    if (response.ok) {
      router.push(`/auth/login?email=${getValues("email")}`);
    }

    setIsLoading(false);
  };

  const { register, handleSubmit, formState, setValue, getValues } =
    useForm<FormFields>({
      defaultValues: {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        organization: "",
        csrfToken,
      },
      mode: "onSubmit",
      resolver: joiResolver(schema),
    });
  const { errors } = formState;

  useEffect(() => {
    setValue("csrfToken", csrfToken);
  }, [csrfToken]);

  return (
    <>
      <HeadSection />
      <AuthLayout>
        <div className="px-8 lg:px-0 sm:mx-auto md:w-full sm:max-w-md">
          <div className="relative w-[163px] h-[44px] mb-2">
            <Image
              src="/img/logo_text_black.png"
              layout="fill"
              alt="Basetool Logo"
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign up for an account
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register("csrfToken")} />

            <FormControl id="email" isInvalid={!isEmpty(errors?.email)}>
              <FormLabel>
                Work email address <sup className="text-red-600">*</sup>
              </FormLabel>
              <Input
                type="email"
                placeholder="ted@lasso.com"
                required={true}
                {...register("email")}
                autoFocus
              />
              <FormHelperText>We'll never share your email</FormHelperText>
              <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl id="password" isInvalid={!isEmpty(errors?.password)}>
              <FormLabel>
                Password <sup className="text-red-600">*</sup>
              </FormLabel>
              <Input
                type="password"
                placeholder="your strong password"
                required={true}
                {...register("password")}
              />
              <FormHelperText>Something strong.</FormHelperText>
              <FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
            </FormControl>

            <div className="flex flex-col space-y-4">
              <div className="w-full">
                <FormControl
                  id="organization"
                  isInvalid={!isEmpty(errors?.organization)}
                >
                  <FormLabel>
                    Organization name <sup className="text-red-600">*</sup>
                  </FormLabel>
                  <Input
                    type="text"
                    placeholder="Apple Inc"
                    {...register("organization")}
                  />
                  <FormErrorMessage>
                    {errors?.organization?.message}
                  </FormErrorMessage>
                </FormControl>
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <FormControl
                    id="firstName"
                    isInvalid={!isEmpty(errors?.firstName)}
                  >
                    <FormLabel>First name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Ted"
                      {...register("firstName")}
                    />
                    <FormErrorMessage>
                      {errors?.firstName?.message}
                    </FormErrorMessage>
                  </FormControl>
                </div>
                <div className="w-1/2">
                  <FormControl
                    id="lastName"
                    isInvalid={!isEmpty(errors?.lastName)}
                  >
                    <FormLabel>Last name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Lasso"
                      {...register("lastName")}
                    />
                    <FormErrorMessage>
                      {errors?.lastName?.message}
                    </FormErrorMessage>
                  </FormControl>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center"></div>
              <div className="text-sm">
                Already have an account?{" "}
                <Link href="/auth/login">
                  <a className="font-medium text-indigo-600 hover:text-indigo-500">
                    Log in
                  </a>
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                colorScheme="blue"
                width="100%"
                disabled={isLoading}
                isLoading={isLoading}
                onClick={handleSubmit(onSubmit)}
              >
                Register
              </Button>
            </div>
          </form>
        </div>
      </AuthLayout>
    </>
  );
}

export default Register;
