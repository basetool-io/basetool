import { createBreakpoints } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/react";

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export default function getChakraTheme() {
  // 1. Update the breakpoints to match Tailwind
  // 2. Extend the theme
  const theme = extendTheme({
    breakpoints: createBreakpoints(breakpoints),
    fonts: {
      heading: "Nunito",
      body: "Nunito",
    },
    colors: {
      blue: {
        "50": "#108105100",
        "100": "#f1f6fe",
        "200": "#bed5f9",
        "300": "#8bb5f4",
        "400": "#5c97ef",
        "500": "#2976ea",
        "600": "#145cc8",
        "700": "#0f4495",
        "800": "#0a2d62",
        "900": "#05152e"
      },
    }
  });

  return theme;
}
