import "../lib/fonts.css";
import "../lib/globals.css";
import "nprogress/nprogress.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import * as gtag from "@/lib/gtag";
import { ChakraProvider, Tooltip } from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
// import { IntercomProvider } from "react-use-intercom";
import { Provider as NextAuthProvider } from "next-auth/client";
import { Provider as ReduxProvider } from "react-redux";
import { ToastContainer, Zoom } from "react-toastify";
import { intercomAppId } from "@/lib/services";
import { isString } from "lodash";
import { segment } from "@/lib/track";
import { useRouter } from "next/router";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import NProgress from "nprogress";
import React, { useEffect } from "react";
import ShowErrorMessages from "@/components/ShowErrorMessages";
import getChakraTheme from "@/lib/chakra";
import store from "@/lib/store";
import type { AppProps } from "next/app";

Tooltip.defaultProps = {
  hasArrow: true,
  placement: "top",
};

const theme = getChakraTheme();

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  NProgress.configure({ showSpinner: false, minimum: 0.15, trickleSpeed: 150 });
  let progressBarTimeout: any = null;

  // Track Google UA page changes
  useEffect(() => {
    const clearProgressBarTimeout = () => {
      if (progressBarTimeout) {
        clearTimeout(progressBarTimeout);
        progressBarTimeout = null;
      }
    };

    const startProgressBar = () => {
      clearProgressBarTimeout();
      // We're debouncing the progressbar for the scenarios where the page is loaded into memory and we want the "native" experience.
      progressBarTimeout = setTimeout(() => {
        NProgress.start();
      }, 100);
    };

    const stopProgressBar = () => {
      clearProgressBarTimeout();
      NProgress.done();
    };

    const handleRouteChangeStart = () => {
      startProgressBar();
    };
    const handleRouteChangeComplete = (url: string) => {
      gtag.pageview(url);
      segment().page();

      stopProgressBar();
    };
    const handleRouteChangeError = () => {
      stopProgressBar();
    };
    const handleHashChangeComplete = () => {
      stopProgressBar();
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("hashChangeComplete", handleHashChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("hashChangeComplete", handleHashChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
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
      <AnalyticsScripts />
      <DndProvider backend={HTML5Backend}>
        <ReduxProvider store={store}>
          <ChakraProvider resetCSS={false} theme={theme}>
            <ShowErrorMessages>
              {/* Conditionally enable Intercom */}
              {isString(intercomAppId) && (
                // <IntercomProvider appId={intercomAppId}>
                  <Component {...pageProps} />
                // </IntercomProvider>
              )}

              {!isString(intercomAppId) && <Component {...pageProps} />}
            </ShowErrorMessages>
            <ToastContainer
              position="bottom-right"
              transition={Zoom}
              autoClose={3000}
              hideProgressBar={true}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              draggablePercent={60}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </ChakraProvider>
        </ReduxProvider>
      </DndProvider>
    </NextAuthProvider>
  );
}
export default MyApp;
