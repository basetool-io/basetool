import "../lib/fonts.css";
import "../lib/globals.css";
import "nprogress/nprogress.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import * as gtag from "@/lib/gtag";
import { ChakraProvider, Tooltip } from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { IntercomProvider } from "react-use-intercom";
import { Provider as NextAuthProvider } from "next-auth/client";
import { Provider as ReduxProvider } from "react-redux";
import { ToastContainer, Zoom } from "react-toastify";
import { inProduction } from "@/lib/environment";
import { segment } from "@/lib/track";
import { useRouter } from "next/router";
import NProgress from "nprogress";
import ProductionScripts from "@/components/ProductionScripts";
import React, { useEffect } from "react";
import ShowErrorMessages from "@/components/ShowErrorMessages";
import getChakraTheme from "@/lib/chakra";
import store from "@/lib/store";
import type { AppProps } from "next/app";

const INTERCOM_APP_ID = "u5el90h1";

Tooltip.defaultProps = {
  hasArrow: true,
  placement: "top",
};

const theme = getChakraTheme();

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  NProgress.configure({ showSpinner: false, minimum: 0.15, trickleSpeed: 150 });
  let timeout: any;

  // Track Google UA page changes
  useEffect(() => {
    const handleRouteChangeStart = () => {
      // We're debouncing the progressbar for the scenarios where the page is loaded into memory and we want the "native" experience.
      timeout = setTimeout(() => {
        NProgress.start();
      }, 100);
    };
    const handleRouteChangeComplete = (url: string) => {
      gtag.pageview(url);
      segment().page();
      clearTimeout(timeout);
      NProgress.done();
    };
    const handleRouteChangeError = () => {
      NProgress.done();
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
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
      {inProduction && <ProductionScripts />}
      <DndProvider backend={HTML5Backend}>
        <ReduxProvider store={store}>
          <ChakraProvider resetCSS={false} theme={theme}>
            <IntercomProvider appId={INTERCOM_APP_ID}>
              <ShowErrorMessages>
                <Component {...pageProps} />
              </ShowErrorMessages>
            </IntercomProvider>
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
