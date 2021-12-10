import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { getBrowserTimezone } from "@/lib/time";
import { signIn, useSession } from "next-auth/client";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useToggle } from "react-use";
import AuthLayout from "@/components/AuthLayout";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function SignIn() {
  const [session, isLoading] = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useToggle(false);

  useEffect(() => {
    if (!isLoading && session) {
      router.push("/");
    }
  }, [isLoading, session]);

  const handleSubmit = async () => {
    setIsDisabled(true);

    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
      lastKnownTimezone: getBrowserTimezone(),
    });

    if (!response) return;

    if (response.error) {
      if (!response || response.error === "CredentialsSignin") {
        toast.error("Login Failed");
      } else {
        toast.error(response.error);
      }
    } else {
      toast.success("Login Successful");
    }

    setIsDisabled(false);
  };

  useEffect(() => {
    if (router.query.email) setEmail(router.query.email as string);
  }, [router]);

  return (
    <>
      <AuthLayout>
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="relative mx-auto w-[200px] h-[54px] my-2">
              <Image
                src="/img/logo_text_black.png"
                layout="fill"
                alt="Basetool Logo"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="py-8 px-4  sm:rounded-lg sm:px-10">
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <FormControl id="email">
                  <FormLabel>Email address</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    placeholder="ted@lasso.com"
                    required={true}
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    autoFocus
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
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
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
                  <Button
                    type="submit"
                    disabled={isDisabled}
                    isLoading={isDisabled}
                    colorScheme="blue"
                    width="100%"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sign in
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
