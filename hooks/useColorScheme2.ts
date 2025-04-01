// import { createContext, useContext, useState } from "react";

// type ColorScheme = "dark" | "light";

// interface ColorSchemeContextType {
//   colorScheme: ColorScheme;
//   toggleColorScheme: () => void;
// }

// export const ColorSchemeContext = createContext<ColorSchemeContextType>({
//   colorScheme: "dark",
//   toggleColorScheme: () => {},
// });

// export function useColorScheme() {
//   return useContext(ColorSchemeContext);
// }

import { createContext, useContext, useState } from "react";

type ColorScheme = "light" | "dark";

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
}

export const ColorSchemeContext = createContext<ColorSchemeContextType>({
  colorScheme: "dark",
  toggleColorScheme: () => {},
});

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}

export function useColorSchemeProvider() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");

  const toggleColorScheme = () => {
    setColorScheme((current) => (current === "light" ? "dark" : "light"));
  };

  return {
    colorScheme,
    toggleColorScheme,
  };
}
