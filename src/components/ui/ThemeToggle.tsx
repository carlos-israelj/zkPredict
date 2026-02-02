import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'zkpredict-light' | 'zkpredict-dark'>('zkpredict-light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Detectar tema actual del DOM
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'zkpredict-light' | 'zkpredict-dark' | null;

    if (currentTheme) {
      setTheme(currentTheme);
    } else {
      // Fallback a localStorage o system preference
      const storedTheme = localStorage.getItem('theme') as 'zkpredict-light' | 'zkpredict-dark' | null;
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.setAttribute('data-theme', storedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? 'zkpredict-dark' : 'zkpredict-light';
        setTheme(defaultTheme);
        document.documentElement.setAttribute('data-theme', defaultTheme);
        localStorage.setItem('theme', defaultTheme);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'zkpredict-light' ? 'zkpredict-dark' : 'zkpredict-light';

    // Actualizar estado local
    setTheme(newTheme);

    // Actualizar DOM
    document.documentElement.setAttribute('data-theme', newTheme);

    // Guardar en localStorage
    localStorage.setItem('theme', newTheme);

    // También actualizar el atributo data-theme en el body
    document.body.setAttribute('data-theme', newTheme);

    // Dispatch evento para que otros componentes puedan reaccionar
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));

    // Log para debug
    console.log('Theme changed to:', newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="btn btn-ghost btn-circle" disabled>
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle transition-all hover:bg-base-300 swap swap-rotate"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'zkpredict-light' ? 'dark' : 'light'} mode`}
    >
      {/* Sun icon (light mode) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 transition-transform ${theme === 'zkpredict-light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180 absolute'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon icon (dark mode) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 transition-transform ${theme === 'zkpredict-dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180 absolute'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  );
}
