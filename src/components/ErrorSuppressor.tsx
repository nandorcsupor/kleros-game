"use client";

import { useEffect } from "react";

export function ErrorSuppressor() {
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = () => {};
    console.warn = () => {};

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
