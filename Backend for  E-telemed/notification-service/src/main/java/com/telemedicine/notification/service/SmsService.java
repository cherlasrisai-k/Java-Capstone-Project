package com.telemedicine.notification.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SmsService {

    @Value("${notification.sms.enabled}")
    private boolean smsEnabled;

    @Value("${sms.twilio.account-sid}")
    private String accountSid;

    @Value("${sms.twilio.auth-token}")
    private String authToken;

    @Value("${sms.twilio.from-number}")
    private String fromNumber;

    @PostConstruct
    public void initTwilio() {
        if (smsEnabled) {
            Twilio.init(accountSid, authToken);
            log.info("Twilio initialized successfully.");
        } else {
            log.warn("SMS is disabled. Twilio will NOT be initialized.");
        }
    }

    public void sendSms(String to, String message) {
        if (!smsEnabled) {
            log.warn("SMS notifications are disabled");
            return;
        }

        try {
            Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(fromNumber),
                    message
            ).create();

            log.info("SMS sent to {} with message: {}", to, message);

        } catch (Exception e) {
            log.error("Failed to send SMS to {}", to, e);
            throw new RuntimeException("Failed to send SMS", e);
        }
    }

    public void sendAppointmentReminder(String to, String patientName, String appointmentDate) {
        String message = String.format(
                "Reminder: %s, you have an appointment on %s. - E-Telemedicine",
                patientName, appointmentDate
        );
        sendSms(to, message);
    }

    public void sendAppointmentConfirmation(String to, String patientName) {
        String message = String.format(
                "Hi %s, your appointment has been confirmed. Check your email for details. - E-Telemedicine",
                patientName
        );
        sendSms(to, message);
    }
}