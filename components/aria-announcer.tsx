"use client";

import { useEffect, useState } from "react";

let announceHandler: ((message: string, priority?: "polite" | "assertive") => void) | null = null;

export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  if (announceHandler) {
    announceHandler(message, priority);
  }
}

export function AriaAnnouncer() {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  useEffect(() => {
    announceHandler = (message, priority = "polite") => {
      if (priority === "assertive") {
        setAssertiveMessage(message);
        setTimeout(() => setAssertiveMessage(""), 1000);
      } else {
        setPoliteMessage(message);
        setTimeout(() => setPoliteMessage(""), 1000);
      }
    };

    return () => {
      announceHandler = null;
    };
  }, []);

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {politeMessage}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMessage}
      </div>
    </>
  );
}
