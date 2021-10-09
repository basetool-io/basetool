import * as segmentSnippet from "@segment/snippet";
import { inProduction } from "@/lib/environment";
import React, { memo } from "react";
import Script from "next/script";

function renderSnippet() {
  const opts = {
    apiKey: process.env.NEXT_PUBLIC_SEGMENT_PUBLIC_KEY,
    // note: the page option only covers SSR tracking.
    // Page.js is used to track other events using `window.analytics.page()`
    page: true,
  };

  if (inProduction) {
    return segmentSnippet.min(opts);
  }

  return segmentSnippet.max(opts);
}

function ProductionScripts() {
  return (
    <>
      <Script dangerouslySetInnerHTML={{ __html: renderSnippet() }} />
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_UA}`}
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_UA}');
        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
      `}
      </Script>
    </>
  );
}

export default memo(ProductionScripts);
