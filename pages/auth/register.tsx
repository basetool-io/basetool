import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { getCsrfToken, useSession } from "next-auth/client";
import { joiResolver } from "@hookform/resolvers/joi";
import { schema } from "@/features/auth/signupSchema";
import { useApi } from "@/hooks";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export interface FormFields {
  csrfToken: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const useCsrfToken = () => {
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const setTheToken = async () => {
      const token = (await getCsrfToken()) as string;
      setCsrfToken(token);
    };
    if (csrfToken === '') {
      setTheToken();
    }
  }, []);

  return csrfToken;
};

function Register() {
  const api = useApi();
  const router = useRouter();
  const [session] = useSession();

  if (session) router.push('/')

  const onSubmit = async (formData: FormFields) => {
    const response = await api.createUser(formData);

    if (response.ok) {
      router.push("/auth/login");
    }
  };

  const { register, handleSubmit, formState, setValue } = useForm<FormFields>({
    resolver: joiResolver(schema),
  });
  const { isDirty, errors, isValid } = formState;

  const csrfToken = useCsrfToken()

  useEffect(() => {
    setValue('csrfToken', csrfToken)
  }, [csrfToken])

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
              value={csrfToken}
              onChange={() => ''}
            />
            <FormControl
              id="email"
              isInvalid={errors?.email && isDirty}
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
                {errors?.email?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              id="password"
              isInvalid={errors?.password && isDirty}
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
                {errors?.password?.message}
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
                  isInvalid={errors?.firstName && isDirty}
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
                  isInvalid={errors?.lastName && isDirty}
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

export default Register;
