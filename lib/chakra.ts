import { createBreakpoints } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/react";

export default async function getChakraTheme() {
  // 1. Update the breakpoints to match Tailwind
  const breakpoints = createBreakpoints({
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  });

  // 2. Extend the theme
  const theme = extendTheme({ breakpoints });

  return theme;
}
