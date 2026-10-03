"use client";

import { useEffect } from "react";

function isEditable(target: EventTarget | null): boolean {
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  return Boolean(element?.closest('input, textarea, [contenteditable="true"], [role="textbox"]'));
}

export default function CopyDeterrence() {
  useEffect(() => {
    const blockClipboard = (event: ClipboardEvent) => {
      if (!isEditable(event.target)) event.preventDefault();
    };
    const blockShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ["c", "x"].includes(event.key.toLowerCase()) && !isEditable(event.target)) {
        event.preventDefault();
      }
    };
    const blockContextMenu = (event: MouseEvent) => {
      if (!isEditable(event.target)) event.preventDefault();
    };
    const blockDrag = (event: DragEvent) => {
      if (!isEditable(event.target)) event.preventDefault();
    };

    document.addEventListener("copy", blockClipboard, true);
    document.addEventListener("cut", blockClipboard, true);
    document.addEventListener("keydown", blockShortcut, true);
    document.addEventListener("contextmenu", blockContextMenu, true);
    document.addEventListener("dragstart", blockDrag, true);
    return () => {
      document.removeEventListener("copy", blockClipboard, true);
      document.removeEventListener("cut", blockClipboard, true);
      document.removeEventListener("keydown", blockShortcut, true);
      document.removeEventListener("contextmenu", blockContextMenu, true);
      document.removeEventListener("dragstart", blockDrag, true);
    };
  }, []);

  return null;
}
