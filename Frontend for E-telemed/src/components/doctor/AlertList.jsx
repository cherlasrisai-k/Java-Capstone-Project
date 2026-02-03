import React from "react";
import "../../styles/alertsList.css";

function AlertsList({ alerts }) {
  if (alerts.length === 0) {
    return <p className="muted-text">All patients stable</p>;
  }
  return (
    <ul className="alerts-list">
      {alerts.map((alert) => (
        <li key={alert.id} className={`alert-item alert-${alert.severity.toLowerCase()}`}>
          <p className="alert-type">{alert.patientName}</p>
          <p className="alert-text">{alert.message}</p>
        </li>
      ))}
    </ul>
  );
}

export default AlertsList;