"use client";

import { useT } from "./PreferencesProvider";

export default function T({ children }: { children: string }) {
  const t = useT();
  return t(children);
}
