import React from "react";
import "../../styles/button.css";

function Button({ children, className = "", onClick, disabled }) {
  return (
    <button className={`btn ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;