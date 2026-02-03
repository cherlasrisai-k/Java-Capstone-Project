import React from 'react';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal">
    <div className="modal-content">
      <p>{message}</p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onCancel}>No</button>
    </div>
  </div>
);

export default ConfirmationModal;