import Image from "next/image";
import Link from "next/link"
import PageWrapper from "@/components/PageWrapper";
import PublicLayout from "@/components/PublicLayout";
import React from "react";

function Custom404() {
  return (
    <PublicLayout>
      <div className="flex w-full h-full md:items-center">
        <PageWrapper className="flex md:max-h-64 md:transform md:-translate-y-1/2" flush={true}>
          <div className="flex flex-col md:flex-row h-full">
            <div className="md:w-1/2 p-2">
              <h1 className="text-2xl">404 - Missing page. Maybe the cat has something to do with it?</h1>
              <br className="hidden md:block"/>
              <Link href="/">Take me home</Link>
            </div>
            <div className="relative flex-1">
              <Image
                src="/img/404_cat.jpg"
                layout="responsive"
                alt="404 cat"
                width={5278}
                height={3519}
              />
            </div>
          </div>
        </PageWrapper>
      </div>
    </PublicLayout>
  );
}

export default Custom404;
