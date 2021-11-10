import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { getBrowserTimezone } from "@/lib/time";
import { getCsrfToken, useSession } from "next-auth/client";
import { isEmpty } from "lodash";
import { joiResolver } from "@hookform/resolvers/joi";
import { schema } from "@/features/auth/signupSchema";
import { useApi } from "@/hooks";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) router.push("/");
  }, [session]);

  const onSubmit = async (formData: FormFields) => {
    const response = await api.createUser({...formData, lastKnownTimezone: getBrowserTimezone()});
    setIsLoading(true);

    if (response.ok) {
      router.push(`/auth/login?email=${getValues('email')}`);
    }

    setIsLoading(false);
  };

  const csrfToken = useCsrfToken();

  const { register, handleSubmit, formState, setValue, getValues } = useForm<FormFields>({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      organization: "",
      csrfToken,
    },
    mode: "all",
    resolver: joiResolver(schema),
  });
  const { errors } = formState;

  useEffect(() => {
    setValue("csrfToken", csrfToken);
  }, [csrfToken]);

  return (
    <>
      <HeadSection />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div  className="relative mx-auto w-[200px] h-[54px] my-2">
            <Image src="/img/logo_text_black.png" layout="fill" alt="Basetool Logo" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign up for an account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Your info
                    </span>
                  </div>
                </div>
              </div>

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
                      <FormLabel>First name</FormLabel>
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
        </div>
      </div>
    </>
  );
}

export default Register;
