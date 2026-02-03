package com.telemedicine.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${notification.email.from}")
    private String fromEmail;

    @Value("${notification.email.fromName}")
    private String fromName;

    @Value("${notification.email.enabled}")
    private boolean emailEnabled;

    public void sendSimpleEmail(String to, String subject, String message) {
        if (!emailEnabled) {
            log.warn("Email notifications are disabled");
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);

            mailSender.send(mailMessage);
            log.info("Simple email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send simple email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent) throws UnsupportedEncodingException {
        if (!emailEnabled) {
            log.warn("Email notifications are disabled");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail,fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables) throws UnsupportedEncodingException {
        Context context = new Context();
        context.setVariables(variables);

        String htmlContent = templateEngine.process(templateName, context);
        sendHtmlEmail(to, subject, htmlContent);
    }

    public void sendAppointmentConfirmation(String to, String patientName, String doctorName, 
                                           String appointmentDate) {
        String subject = "Appointment Confirmation - E-Telemedicine";
        String message = String.format(
            "Dear %s,\n\n" +
            "Your appointment with Dr. %s has been confirmed.\n" +
            "Date & Time: %s\n\n" +
            "Please arrive 10 minutes early.\n\n" +
            "Best regards,\n" +
            "E-Telemedicine Platform",
            patientName, doctorName, appointmentDate
        );
        sendSimpleEmail(to, subject, message);
    }

    public void sendConsultationComplete(String to, String patientName, String doctorName) {
        String subject = "Consultation Complete - E-Telemedicine";
        String message = String.format(
            "Dear %s,\n\n" +
            "Your consultation with Dr. %s has been completed.\n" +
            "You can view your consultation details and prescription in your patient portal.\n\n" +
            "Best regards,\n" +
            "E-Telemedicine Platform",
            patientName, doctorName
        );
        sendSimpleEmail(to, subject, message);
    }

    public void sendPrescriptionCreated(String to, String patientName, String doctorName, 
                                       int medicationCount) {
        String subject = "New Prescription Available - E-Telemedicine";
        String message = String.format(
            "Dear %s,\n\n" +
            "Dr. %s has created a new prescription for you with %d medication(s).\n" +
            "Please log in to view your prescription details and instructions.\n\n" +
            "Best regards,\n" +
            "E-Telemedicine Platform",
            patientName, doctorName, medicationCount
        );
        sendSimpleEmail(to, subject, message);
    }
}
