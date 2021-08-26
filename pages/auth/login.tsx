import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { NextPageContext } from "next";
import { getCsrfToken, useSession } from "next-auth/client";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect } from "react";

export default function SignIn({ csrfToken }: { csrfToken: string }) {
  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form
            method="post"
            action="/api/auth/callback/credentials"
            className="space-y-6"
          >
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                name="email"
                placeholder="ted@lasso.com"
                required={true}
              />
              <FormHelperText>We'll never share your email.</FormHelperText>
            </FormControl>

            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                placeholder="your strong password"
                required={true}
              />
              <FormHelperText>Something strong.</FormHelperText>
            </FormControl>

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
                No account?{" "}
                <Link href="/auth/register">
                  <a className="font-medium text-indigo-600 hover:text-indigo-500">
                    Register
                  </a>
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context: NextPageContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
