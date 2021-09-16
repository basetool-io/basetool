import "../lib/fonts.css";
import "../lib/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import * as gtag from "@/lib/gtag";
import { ChakraProvider, Tooltip } from "@chakra-ui/react";
import { IntercomProvider } from "react-use-intercom";
import { Provider as NextAuthProvider } from "next-auth/client";
import { ProfileProvider } from "@/lib/ProfileContext";
import { Provider as ReduxProvider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { inProduction } from "@/lib/environment";
import { useGetProfileQuery } from "@/features/profile/api-slice";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useMemo } from "react";
import Script from "next/script";
import store from "@/lib/store";
import type { AppProps } from "next/app";

const INTERCOM_APP_ID = "u5el90h1";

Tooltip.defaultProps = {
  hasArrow: true,
  placement: "top",
};

const GetProfile = ({ children }: { children: ReactNode }) => {
  const { data: profileResponse, isLoading } =
    useGetProfileQuery(null); // not sure why this method needs 1-2 args. I added null to stisfy that req.
  const profile = useMemo(
    () => (profileResponse?.ok ? profileResponse?.data : {}),
    [profileResponse, isLoading]
  );

  return (
    <ProfileProvider value={profile}>{children}</ProfileProvider>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Track Google UA page changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <NextAuthProvider
      options={{
        clientMaxAge: 0,
        keepAlive: 0,
      }}
      session={pageProps.session}
    >
      {inProduction && (
        <>
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_UA}`}
          />

          <Script strategy="lazyOnload">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_UA}');
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
        `}
          </Script>
        </>
      )}
      <ReduxProvider store={store}>
        <ChakraProvider resetCSS={false}>
          <IntercomProvider appId={INTERCOM_APP_ID}>
            <GetProfile>
              <Component {...pageProps} />
            </GetProfile>
          </IntercomProvider>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </ChakraProvider>
      </ReduxProvider>
    </NextAuthProvider>
  );
}
export default MyApp;
