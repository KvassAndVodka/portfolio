"use client";

import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("en-PH", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Manila",
});

/** The time in Cagayan de Oro, filled in after hydration so the server's clock never mismatches. */
export default function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <time>{time ?? "--:--"} PHT</time>;
}
