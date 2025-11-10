import React, { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return (localStorage.getItem("theme") as "light" | "dark") ?? "light";
    } catch {
      return "light";
    }
  });

  // ensure document root has correct class on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="p-2 rounded-md hover:bg-accent/30"
      type="button"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}