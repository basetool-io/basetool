import "../lib/fonts.css";
import "../lib/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { ChakraProvider, Tooltip } from "@chakra-ui/react";
import { Provider as NextAuthProvider } from "next-auth/client";
import { Provider as ReduxProvider } from "react-redux";
import { ToastContainer } from "react-toastify";
import React from "react";
import store from "@/lib/store";
import type { AppProps } from "next/app";

Tooltip.defaultProps = {
  hasArrow: true,
  placement: "top",
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextAuthProvider
      options={{
        clientMaxAge: 0,
        keepAlive: 0,
      }}
      session={pageProps.session}
    >
      <ReduxProvider store={store}>
        <ChakraProvider resetCSS={false}>
          <Component {...pageProps} />
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
