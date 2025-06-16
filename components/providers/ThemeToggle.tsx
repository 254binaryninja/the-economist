"use client";

import { MoonIcon,SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import React, { useEffect,useState } from "react";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensures that the component is rendered client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on the server-side to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    <button onClick={() => toggleTheme()} className="m-1 p-2">
      {theme === "dark" ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
    </button>
  );
}

export default ThemeToggle;
