"use client";

import { useEffect, useState } from "react";
import { getStatus } from "@/lib/hours";

const HOURS = [
  { day: "Mon", label: "Monday", time: "8:00 am – 6:00 pm" },
  { day: "Tue", label: "Tuesday", time: "8:00 am – 6:00 pm" },
  { day: "Wed", label: "Wednesday", time: "8:00 am – 6:00 pm" },
  { day: "Thu", label: "Thursday", time: "8:00 am – 6:00 pm" },
  { day: "Fri", label: "Friday", time: "8:00 am – 6:00 pm" },
  { day: "Sat", label: "Saturday", time: "8:00 am – 6:00 pm" },
  { day: "Sun", label: "Sunday", time: "Closed" },
];

export default function HoursCard({ showStatus = false }: { showStatus?: boolean }) {
  /* the "· today" row highlight is gone (removed on request) — the list
     is now purely informational */

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
        <div key={h.day} className="hours-row">
          <span className="h-day">{h.label}</span>
          <span className="h-time">{h.time}</span>
        </div>
      ))}
    </div>
  );
}