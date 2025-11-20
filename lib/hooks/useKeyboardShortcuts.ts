import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean; // Treats Command on macOS as ctrl
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
  label?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const shortcut of shortcutsRef.current) {
        const requiresCtrl = shortcut.ctrl ?? false;
        const requiresShift = shortcut.shift ?? false;
        const requiresAlt = shortcut.alt ?? false;
        const requiresMeta = shortcut.meta ?? false;

        if (isInputElement) {
          const requiresModifier = requiresCtrl || requiresShift || requiresAlt || requiresMeta;
          const isEscape = shortcut.key.toLowerCase() === "escape";
          if (!requiresModifier && !isEscape) {
            continue;
          }
        }

        const ctrlPressed = event.ctrlKey || event.metaKey;
        const matchesCtrl = shortcut.ctrl === undefined ? true : ctrlPressed === shortcut.ctrl;
        const matchesShift = shortcut.shift === undefined ? true : event.shiftKey === shortcut.shift;
        const matchesAlt = shortcut.alt === undefined ? true : event.altKey === shortcut.alt;
        const matchesMeta = shortcut.meta === undefined ? true : event.metaKey === shortcut.meta;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          matchesCtrl &&
          matchesShift &&
          matchesAlt &&
          matchesMeta
        ) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}
