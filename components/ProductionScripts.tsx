import * as segmentSnippet from "@segment/snippet";
import {
  googleAnalytics4Code,
  googleAnalyticsUACode,
  segmentPublicKey,
} from "@/lib/services";
import { inProduction } from "@/lib/environment";
import React, { memo } from "react";
import Script from "next/script";

function renderSnippet() {
  const opts = {
    apiKey: segmentPublicKey,
    // note: the page option only covers SSR tracking.
    // Page.js is used to track other events using `window.analytics.page()`
    page: true,
  };

  if (inProduction) {
    return segmentSnippet.min(opts);
  }

  return segmentSnippet.max(opts);
}

const ProductionScripts = () => {
  if (!googleAnalyticsUACode || !googleAnalytics4Code) return null;

  return (
    <>
      <Script dangerouslySetInnerHTML={{ __html: renderSnippet() }} />
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsUACode}`}
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${googleAnalyticsUACode}');
        gtag('config', '${googleAnalytics4Code}');
      `}
      </Script>
    </>
  );
};

export default memo(ProductionScripts);
