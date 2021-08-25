import { DefaultSession } from "next-auth";
import { NextPageContext } from "next";
import { getCsrfToken, getSession } from "next-auth/client";
import { useApi } from "@/hooks";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";
import React from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  FormErrorMessage,
} from "@chakra-ui/react";
import { joiResolver } from "@hookform/resolvers/joi";
import { schema } from "@/features/auth/signupSchema";

export interface FormFields {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

function Register() {
  const api = useApi();
  const router = useRouter();

  const onSubmit = async (formData: FormFields) => {
    const response = await api.createUser(formData);

    if (response.ok) {
      router.push("/api/auth/signin");
    }
  };

  const { register, handleSubmit, formState } = useForm<FormFields>({
    resolver: joiResolver(schema),
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign up for an account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input
              type="hidden"
              {...register("csrfToken")}
              defaultValue={csrfToken}
            />
            <FormControl
              id="email"
              isInvalid={formState.errors?.email && formState.isDirty}
            >
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                placeholder="ted@lasso.com"
                required={true}
                {...register("email")}
              />
              <FormHelperText>We'll never share your email.</FormHelperText>
              <FormErrorMessage>
                {formState.errors?.email?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              id="password"
              isInvalid={formState.errors?.password && formState.isDirty}
            >
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="your strong password"
                required={true}
                {...register("password")}
              />
              <FormHelperText>Something strong.</FormHelperText>
              <FormErrorMessage>
                {formState.errors?.password?.message}
              </FormErrorMessage>
            </FormControl>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Your info</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="w-1/2">
                <FormControl
                  id="firstName"
                  isInvalid={formState.errors?.firstName && formState.isDirty}
                >
                  <FormLabel>First name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Ted"
                    {...register("firstName")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.firstName?.message}
                  </FormErrorMessage>
                </FormControl>
              </div>
              <div className="w-1/2">
                <FormControl
                  id="lastName"
                  isInvalid={formState.errors?.lastName && formState.isDirty}
                >
                  <FormLabel>First name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Lasso"
                    {...register("lastName")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.lastName?.message}
                  </FormErrorMessage>
                </FormControl>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                Have an account?{" "}
                <Link href="/auth/login">
                  <a className="font-medium text-indigo-600 hover:text-indigo-500">
                    Log in
                  </a>
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session: DefaultSession | null = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

export default Register;
