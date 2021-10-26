import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { IApiResponse } from "@/features/api/ApiResponse";
import { SerializedError } from "@reduxjs/toolkit";
import { useIntercom } from "react-use-intercom";
import PageWrapper from "./PageWrapper";
import React, { memo, useEffect, useMemo } from "react";

function ErrorWrapper({
  error,
}: {
  error: FetchBaseQueryError | SerializedError;
}) {
  const { boot, show } = useIntercom();
  const errorData = useMemo(
    () => ("data" in error ? (error?.data as IApiResponse) : undefined),
    [error]
  );

  useEffect(() => {
    try {
      boot();
    } catch (error) {}
    show();
  }, []);

  return (
    <PageWrapper heading="An error has occured.">
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <div className="font-bold text-sm uppercase">Error message:</div>
            {errorData?.messages && errorData?.messages?.join(" ")}
            {"message" in error && error?.message && error?.message}
          </div>
          {errorData?.meta?.links && (
            <div>
              <div className="font-bold text-sm uppercase">Helpful links:</div>
              <div>
                {errorData?.meta?.links.map((link: string, idx: number) => (
                  <a href={link} key={idx}>{link}</a>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* <div>Link to docs</div> */}
      </div>
    </PageWrapper>
  );
}

export default memo(ErrorWrapper);
