import React from "react";
import "../../styles/statusPill.css";

function StatusPill({ status }) {
  const lower = status.toLowerCase();
  const className = `status-pill status-${lower}`;
  return <span className={className}>{status}</span>;
}

export default StatusPill;