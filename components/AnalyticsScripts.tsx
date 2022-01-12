import * as segmentSnippet from "@segment/snippet";
import {
  googleAnalytics4Code,
  googleAnalyticsUACode,
  segmentPublicKey,
} from "@/lib/services";
import { inProduction } from "@/lib/environment";
import { isString } from "lodash";
import { useSession } from "next-auth/client";
import React, { memo, useEffect, useMemo, useState } from "react";
import Script from "next/script";

function renderSegmentSnippet() {
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

const useUserAnalytics = () => {
  const [UA, setUA] = useState<string | undefined>();

  useEffect(() => {
    if (typeof navigator !== "undefined" && isString(navigator?.userAgent)) {
      setUA(navigator.userAgent);
    }
  }, []);

  return UA;
};

const FullStoryScripts = () => {
  const fullstoryEnabled = process.env.NEXT_PUBLIC_ENABLE_FULLSTORY === "1" && process.env.NEXT_PUBLIC_FULLSTORY_ORG;
  const [session] = useSession();
  console.log('process.env.NEXT_PUBLIC_ENABLE_FULLSTORY->', process.env.NEXT_PUBLIC_ENABLE_FULLSTORY, process.env.NEXT_PUBLIC_FULLSTORY_ORG, fullstoryEnabled)

  useEffect(() => {
    if (window && window.FS && session && session.user) {
      window.FS.identify(session?.user?.id, {
        displayName: session?.user?.name,
        email: session?.user?.email,
      });
    }
  }, [session]);

  if (!fullstoryEnabled) return null;

  return (
    <Script id="fullstory" strategy="lazyOnload">
      {`window['_fs_debug'] = false;
      window['_fs_host'] = 'fullstory.com';
      window['_fs_script'] = 'edge.fullstory.com/s/fs.js';
      window['_fs_org'] = '${process.env.NEXT_PUBLIC_FULLSTORY_ORG}';
      window['_fs_namespace'] = 'FS';
      (function(m,n,e,t,l,o,g,y){
      if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
      g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];
      o=n.createElement(t);o.async=1;o.crossOrigin='anonymous';o.src='https://'+_fs_script;
      y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
      g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g('event',{n:i,p:v},s)};
      g.anonymize=function(){g.identify(!!0)};
      g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};
      g.log = function(a,b){g("log",[a,b])};
      g.consent=function(a){g("consent",!arguments.length||a)};
      g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
      g.clearUserCookie=function(){};
      g.setVars=function(n, p){g('setVars',[n,p]);};
      g._w={};y='XMLHttpRequest';g._w[y]=m[y];y='fetch';g._w[y]=m[y];
      if(m[y])m[y]=function(){return g._w[y].apply(this,arguments)};
      g._v="1.3.0";
      })(window,document,window['_fs_namespace'],'script','user');`}
    </Script>
  );
};

const GoogleAnalyticsScripts = () => {
  if (!googleAnalyticsUACode || !googleAnalytics4Code) return null;

  return (
    <>
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

const ProductionScripts = () => {
  const UA = useUserAnalytics();
  const isCheckly = useMemo(
    () => UA && isString(UA) && navigator.userAgent.includes("Checkly"),
    [UA]
  );
  const showAnalyticsScripts = useMemo(
    () => inProduction && !isCheckly,
    [inProduction, isCheckly]
  );

  if (!showAnalyticsScripts) return null;

  return (
    <>
      <Script dangerouslySetInnerHTML={{ __html: renderSegmentSnippet() }} />
      <GoogleAnalyticsScripts />
      <FullStoryScripts />
    </>
  );
};

export default memo(ProductionScripts);
