import "../lib/globals.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { Provider as ReduxProvider } from "react-redux";
import { ChakraProvider, Tooltip } from "@chakra-ui/react";
import store from "@/lib/store";
import React from "react";
import { ToastContainer } from "react-toastify";

Tooltip.defaultProps = {
  hasArrow: true,
  placement: "top",
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
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
  );
}
export default MyApp;
