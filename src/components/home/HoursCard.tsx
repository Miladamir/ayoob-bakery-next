"use client";

import { useEffect, useState } from "react";
import { getStatus } from "@/lib/hours";

const HOURS = [
  { day: "Mon", label: "Monday", time: "6:30 am – 4:00 pm" },
  { day: "Tue", label: "Tuesday", time: "6:30 am – 4:00 pm" },
  { day: "Wed", label: "Wednesday", time: "6:30 am – 4:00 pm" },
  { day: "Thu", label: "Thursday", time: "6:30 am – 4:00 pm" },
  { day: "Fri", label: "Friday", time: "6:30 am – 4:00 pm" },
  { day: "Sat", label: "Saturday", time: "6:30 am – 3:00 pm" },
  { day: "Sun", label: "Sunday", time: "7:00 am – 2:00 pm" },
];

export default function HoursCard({ showStatus = false }: { showStatus?: boolean }) {
  const [today, setToday] = useState("");

  useEffect(() => {
    const mark = () => {
      try {
        const day = new Intl.DateTimeFormat("en-AU", {
          timeZone: "Australia/Melbourne",
          weekday: "short",
        }).format(new Date());
        setToday(day);
      } catch {
        /* timezone API unavailable — no highlight */
      }
    };
    mark();
    const t = window.setInterval(mark, 60000);
    return () => window.clearInterval(t);
  }, []);

  // optional live status pill — computed after mount (no hydration mismatch)
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => {
    if (!showStatus) return;
    const upd = () => setStatus(getStatus());
    upd();
    const t = window.setInterval(upd, 30000);
    return () => window.clearInterval(t);
  }, [showStatus]);

  return (
    <div className="hours-card">
      <div className="hours-head">
        <h3>Opening hours</h3>
        {showStatus && status && (
          <div className={`status-pill${status.open ? "" : " closed"}`}>
            <span className="pulse" />
            <span className="st-text">{status.text}</span>
          </div>
        )}
      </div>
      {HOURS.map((h) => (
        <div key={h.day} className={`hours-row${today === h.day ? " today" : ""}`}>
          <span className="h-day">{h.label}</span>
          <span className="h-time">{h.time}</span>
        </div>
      ))}
    </div>
  );
}