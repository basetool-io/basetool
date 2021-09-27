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
  });

  return theme;
}
