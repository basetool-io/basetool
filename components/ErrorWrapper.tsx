import IApiResponse from "@/features/api/ApiResponse";
import PageWrapper from "./PageWrapper";
import React from "react";

function ErrorWrapper({ error }: { error: IApiResponse }) {
  return (
    <PageWrapper heading="An error has occured.">
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <div className="font-bold text-sm uppercase">Error message:</div>
            {error?.data?.messages.join(' ')}
          </div>
          {error?.data?.meta?.links && <div>
            <div className="font-bold text-sm uppercase">Helpful links:</div>
            <div>{error?.data?.meta?.links.map((link: string) => <a href={link}>{link}</a>)}</div>
          </div>}
        </div>
        {/* <div>Link to docs</div> */}
      </div>
    </PageWrapper>
  );
}

export default ErrorWrapper;
