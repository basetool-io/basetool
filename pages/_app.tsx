import "../lib/fonts.css";
import "../lib/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import * as gtag from "@/lib/gtag";
import { ChakraProvider, Tooltip } from "@chakra-ui/react";
import { IntercomProvider } from "react-use-intercom";
import { Provider as NextAuthProvider } from "next-auth/client";
import { Provider as ReduxProvider } from "react-redux";
import { ToastContainer, Zoom } from "react-toastify";
import { inProduction } from "@/lib/environment";
import { useRouter } from "next/router";
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
      {inProduction && <ProductionScripts />}
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
    </NextAuthProvider>
  );
}
export default MyApp;
