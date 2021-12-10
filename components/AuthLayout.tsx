import HeadSection from "./HeadSection";
import Image from "next/image";
import React, { ReactNode } from "react";

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeadSection />

      <div className="min-h-screen bg-white flex flex-1 overflow-y-auto">
        <div className="w-full flex flex-col sm:flex-row">
          <div className="sm:w-1/2 flex flex-col justify-center py-8">
            {children}
          </div>
          <div className="relative sm:w-1/2 bg-squares flex py-24 sm:py-0">
            <div className="flex flex-col justify-center flex-1 max-w-3xl px-12">
              <div className="relative flex max-w-full mx-auto">
                <Image
                  src="/img/heading.png"
                  // layout="fill"
                  width="565"
                  height="156"
                  alt="View and manage all your data in one place"
                />
              </div>
              <div className="relative flex max-w-full mx-auto mt-24">
                <Image
                  src="/img/illustration.svg"
                  // layout="fill"
                  width="674"
                  height="547"
                  alt="View and manage all your data in one place"
                />
              </div>
            </div>
          </div>
        </div>

        {/* <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"></div>
        </div> */}
      </div>
    </>
  );
}

export default AuthLayout;
