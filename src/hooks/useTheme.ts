import { useState, useEffect } from "react";

export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkDark = () => {
        return (
          document.documentElement.classList.contains("dark") ||
          window.matchMedia("(prefers-color-scheme: dark)").matches
        );
      };

      setIsDark(checkDark());

      const observer = new MutationObserver(() => {
        setIsDark(checkDark());
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        if (
          !document.documentElement.classList.contains("dark") &&
          !document.documentElement.classList.contains("light")
        ) {
          setIsDark(e.matches);
        }
      };
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
  }, []);

  return { isDark };
};
