package com.telemedicine.notification.service;

import com.telemedicine.common.exception.ResourceNotFoundException;
import com.telemedicine.notification.dto.NotificationDTO;
import com.telemedicine.notification.dto.NotificationRequestDTO;
import com.telemedicine.notification.model.Notification;
import com.telemedicine.notification.model.NotificationStatus;
import com.telemedicine.notification.model.NotificationType;
import com.telemedicine.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    
    @Transactional
    public NotificationDTO sendNotification(NotificationRequestDTO request) {
        log.info("Sending notification to user: {} via {}", request.getUserId(), request.getType());

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .type(request.getType())
                .status(NotificationStatus.PENDING)
                .subject(request.getSubject())
                .message(request.getMessage())
                .recipient(request.getRecipient())
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .build();

        try {
            switch (request.getType()) {
                case EMAIL -> {
                    emailService.sendSimpleEmail(
                        request.getRecipient(),
                        request.getSubject(),
                        request.getMessage()
                    );
                    notification.setStatus(NotificationStatus.SENT);
                    notification.setSentAt(LocalDateTime.now());
                }
                default -> {
                    log.warn("Notification type {} not implemented yet", request.getType());
                    notification.setStatus(NotificationStatus.FAILED);
                    notification.setErrorMessage("Notification type not implemented");
                }
            }
        } catch (Exception e) {
            log.error("Failed to send notification", e);
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
        }

        Notification saved = notificationRepository.save(notification);
        log.info("Notification saved with ID: {} and status: {}", saved.getId(), saved.getStatus());

        return NotificationDTO.from(saved);
    }

    public NotificationDTO getNotificationById(Long id) {
        log.info("Fetching notification by ID: {}", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        return NotificationDTO.from(notification);
    }

    public Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable) {
        log.info("Fetching notifications for user: {}", userId);
        return notificationRepository.findByUserId(userId, pageable)
                .map(NotificationDTO::from);
    }

    public Page<NotificationDTO> getUserNotificationsByStatus(Long userId, NotificationStatus status, 
                                                             Pageable pageable) {
        log.info("Fetching notifications for user: {} with status: {}", userId, status);
        return notificationRepository.findByUserIdAndStatus(userId, status, pageable)
                .map(NotificationDTO::from);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndStatus(userId, NotificationStatus.SENT);
    }

    @Transactional
    public NotificationDTO markAsRead(Long id) {
        log.info("Marking notification as read: {}", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        notification.setStatus(NotificationStatus.READ);
        notification.setReadAt(LocalDateTime.now());

        Notification updated = notificationRepository.save(notification);
        return NotificationDTO.from(updated);
    }

    // Convenience methods for specific notification types
    @Transactional
    public void sendAppointmentConfirmation(Long userId, String email, String patientName, 
                                           String doctorName, String appointmentDate) {
        NotificationRequestDTO request = NotificationRequestDTO.builder()
                .userId(userId)
                .type(NotificationType.EMAIL)
                .subject("Appointment Confirmation")
                .message(String.format("Your appointment with Dr. %s on %s has been confirmed.", 
                        doctorName, appointmentDate))
                .recipient(email)
                .referenceType("APPOINTMENT")
                .build();

        sendNotification(request);
        emailService.sendAppointmentConfirmation(email, patientName, doctorName, appointmentDate);
    }

    @Transactional
    public void sendConsultationComplete(Long userId, String email, String patientName, 
                                        String doctorName) {
        NotificationRequestDTO request = NotificationRequestDTO.builder()
                .userId(userId)
                .type(NotificationType.EMAIL)
                .subject("Consultation Complete")
                .message(String.format("Your consultation with Dr. %s has been completed.", doctorName))
                .recipient(email)
                .referenceType("CONSULTATION")
                .build();

        sendNotification(request);
        emailService.sendConsultationComplete(email, patientName, doctorName);
    }

    @Transactional
    public void sendPrescriptionCreated(Long userId, String email, String patientName, 
                                       String doctorName, int medicationCount) {
        NotificationRequestDTO request = NotificationRequestDTO.builder()
                .userId(userId)
                .type(NotificationType.EMAIL)
                .subject("New Prescription Available")
                .message(String.format("Dr. %s has created a new prescription with %d medication(s).", 
                        doctorName, medicationCount))
                .recipient(email)
                .referenceType("PRESCRIPTION")
                .build();

        sendNotification(request);
        emailService.sendPrescriptionCreated(email, patientName, doctorName, medicationCount);
    }
    
}
