export function buildAppointmentHtmlEmail(patient, doctor, appointment) {
  return `
<html>
<body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
<h2 style="color: #2563eb;">Appointment Confirmation</h2>
 
      <p>Dear <strong>${patient.firstName} ${patient.lastName}</strong>,</p>
 
      <p>Your appointment has been <strong>successfully confirmed</strong>.</p>
 
      <h3 style="margin-top:20px;">📅 Appointment Details</h3>
<table style="width: 100%; border-collapse: collapse;">
<tr>
<td style="padding: 8px; border: 1px solid #ddd;">Doctor</td>
<td style="padding: 8px; border: 1px solid #ddd;">Dr. ${doctor.firstName} ${doctor.lastName}</td>
</tr>
<tr>
<td style="padding: 8px; border: 1px solid #ddd;">Date & Time</td>
<td style="padding: 8px; border: 1px solid #ddd;">
            ${new Date(appointment.appointmentDate).toLocaleString()}
</td>
</tr>
<tr>
<td style="padding: 8px; border: 1px solid #ddd;">Reason</td>
<td style="padding: 8px; border: 1px solid #ddd;">${appointment.reason}</td>
</tr>
</table>
 
      <p style="margin-top: 25px;">
        Please be available 10 minutes early.  
        You can check additional details in your patient dashboard.
</p>
 
      <p style="margin-top: 30px;">
        Regards,<br/>
<strong>E-TeleMed Team</strong>
</p>
 
    </body>
</html>
  `;
}