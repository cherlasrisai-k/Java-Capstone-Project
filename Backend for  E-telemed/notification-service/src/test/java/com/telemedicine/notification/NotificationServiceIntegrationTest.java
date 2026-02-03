package com.telemedicine.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telemedicine.notification.dto.EmailRequestDTO;
import com.telemedicine.notification.dto.NotificationDTO;
import com.telemedicine.notification.dto.NotificationRequestDTO;
import com.telemedicine.notification.model.NotificationStatus;
import com.telemedicine.notification.model.NotificationType;
import com.telemedicine.notification.service.EmailService;
import com.telemedicine.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive integration tests for Notification Service
 * Tests email/SMS notifications, notification management, and authorization
 */
@SpringBootTest(classes = NotificationServiceApplication.class)
@AutoConfigureMockMvc
public class NotificationServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private EmailService emailService;

   
    private NotificationRequestDTO emailNotificationRequest;
    private NotificationRequestDTO smsNotificationRequest;
    private NotificationDTO sampleNotification;
    private List<NotificationDTO> sampleNotificationList;

    @BeforeEach
    void setUp() throws UnsupportedEncodingException {
        // ===== Setup Email Notification Request =====
        emailNotificationRequest = NotificationRequestDTO.builder()
                .userId(1L)
                .type(NotificationType.EMAIL)
                .subject("Appointment Confirmation")
                .message("Your appointment with Dr. Smith has been confirmed for tomorrow at 10:00 AM.")
                .recipient("patient@example.com")
                .referenceType("APPOINTMENT")
                .referenceId(1L)
                .build();

        // ===== Setup SMS Notification Request =====
        smsNotificationRequest = NotificationRequestDTO.builder()
                .userId(1L)
                .type(NotificationType.SMS)
                .subject("Appointment Reminder")
                .message("Reminder: Your appointment is tomorrow at 10:00 AM")
                .recipient("+919876543210")
                .referenceType("APPOINTMENT")
                .referenceId(1L)
                .build();

        // ===== Setup Sample Notification =====
        sampleNotification = NotificationDTO.builder()
                .id(1L)
                .userId(1L)
                .type(NotificationType.EMAIL)
                .status(NotificationStatus.SENT)
                .subject("Appointment Confirmation")
                .message("Your appointment with Dr. Smith has been confirmed for tomorrow at 10:00 AM.")
                .recipient("patient@example.com")
                .referenceType("APPOINTMENT")
                .referenceId(1L)
                .sentAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        NotificationDTO notification2 = NotificationDTO.builder()
                .id(2L)
                .userId(1L)
                .type(NotificationType.EMAIL)
                .status(NotificationStatus.SENT)
                .subject("Prescription Available")
                .message("Your prescription is ready to view")
                .recipient("patient@example.com")
                .referenceType("PRESCRIPTION")
                .referenceId(2L)
                .sentAt(LocalDateTime.now().minusHours(2))
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        NotificationDTO notification3 = NotificationDTO.builder()
                .id(3L)
                .userId(1L)
                .type(NotificationType.SMS)
                .status(NotificationStatus.FAILED)
                .subject("Test SMS")
                .message("Test message")
                .recipient("+919876543210")
                .errorMessage("Invalid phone number format")
                .createdAt(LocalDateTime.now().minusHours(3))
                .build();

        sampleNotificationList = Arrays.asList(sampleNotification, notification2, notification3);

        // ===== Mock NotificationService =====
        Mockito.when(notificationService.sendNotification(any(NotificationRequestDTO.class)))
                .thenReturn(sampleNotification);

        Mockito.when(notificationService.getNotificationById(anyLong()))
                .thenReturn(sampleNotification);

        Page<NotificationDTO> notificationPage = new PageImpl<>(
                sampleNotificationList, PageRequest.of(0, 10), 3);

        Mockito.when(notificationService.getUserNotifications(anyLong(), any()))
                .thenReturn(notificationPage);

        Mockito.when(notificationService.getUserNotificationsByStatus(anyLong(), any(NotificationStatus.class), any()))
                .thenAnswer(invocation -> {
                    NotificationStatus status = invocation.getArgument(1);
                    List<NotificationDTO> filtered = sampleNotificationList.stream()
                            .filter(n -> n.getStatus() == status)
                            .toList();
                    return new PageImpl<>(filtered, PageRequest.of(0, 10), filtered.size());
                });

        Mockito.when(notificationService.getUnreadCount(anyLong()))
                .thenReturn(2L);

        Mockito.when(notificationService.markAsRead(anyLong()))
                .thenAnswer(invocation -> {
                    NotificationDTO read = NotificationDTO.builder()
                            .id(sampleNotification.getId())
                            .userId(sampleNotification.getUserId())
                            .type(sampleNotification.getType())
                            .status(NotificationStatus.READ)
                            .subject(sampleNotification.getSubject())
                            .message(sampleNotification.getMessage())
                            .recipient(sampleNotification.getRecipient())
                            .referenceType(sampleNotification.getReferenceType())
                            .referenceId(sampleNotification.getReferenceId())
                            .sentAt(sampleNotification.getSentAt())
                            .readAt(LocalDateTime.now())
                            .createdAt(sampleNotification.getCreatedAt())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return read;
                });

        // ===== Mock Email and SMS Services =====
        Mockito.doNothing().when(emailService).sendSimpleEmail(anyString(), anyString(), anyString());
        Mockito.doNothing().when(emailService).sendHtmlEmail(anyString(), anyString(), anyString());
    }

    // ================== NOTIFICATION SENDING TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendEmailNotification_AsDoctor_Success() throws Exception {
        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emailNotificationRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.type").value("EMAIL"))
                .andExpect(jsonPath("$.data.status").value("SENT"))
                .andExpect(jsonPath("$.data.subject").value("Appointment Confirmation"))
                .andExpect(jsonPath("$.data.recipient").value("patient@example.com"));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendSmsNotification_AsDoctor_Success() throws Exception {
        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(smsNotificationRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testSendNotification_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emailNotificationRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testSendNotification_AsPatient_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emailNotificationRequest)))
                .andExpect(status().isForbidden());
    }

    // ================== EMAIL SENDING TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendEmail_Simple_Success() throws Exception {
        EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                .to("patient@example.com")
                .subject("Test Email")
                .message("This is a test email")
                .html(false)
                .build();

        mockMvc.perform(post("/api/v1/notifications/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emailRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Email sent successfully"));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendEmail_Html_Success() throws Exception {
        EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                .to("patient@example.com")
                .subject("Test HTML Email")
                .message("<h1>Hello</h1><p>This is HTML content</p>")
                .html(true)
                .build();

        mockMvc.perform(post("/api/v1/notifications/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emailRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testSendEmail_AsAdmin_Success() throws Exception {
        EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                .to("user@example.com")
                .subject("Admin Email")
                .message("Message from admin")
                .html(false)
                .build();

        mockMvc.perform(post("/api/v1/notifications/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emailRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ================== NOTIFICATION RETRIEVAL TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetNotificationById_AsPatient_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.type").value("EMAIL"))
                .andExpect(jsonPath("$.data.status").value("SENT"));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testGetNotificationById_AsDoctor_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testGetNotificationById_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetUserNotifications_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/user/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content", hasSize(3)))
                .andExpect(jsonPath("$.data.totalElements").value(3))
                .andExpect(jsonPath("$.data.content[0].type").value("EMAIL"))
                .andExpect(jsonPath("$.data.content[1].status").value("SENT"))
                .andExpect(jsonPath("$.data.content[2].status").value("FAILED"));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetUserNotificationsByStatus_Sent_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/user/1/status/SENT")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content", hasSize(2)));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetUserNotificationsByStatus_Failed_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/user/1/status/FAILED")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content", hasSize(1)));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetUnreadCount_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/user/1/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(2));
    }

    // ================== NOTIFICATION MANAGEMENT TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testMarkAsRead_AsPatient_Success() throws Exception {
        mockMvc.perform(put("/api/v1/notifications/1/mark-read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("READ"))
                .andExpect(jsonPath("$.data.readAt").exists());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testMarkAsRead_AsDoctor_Success() throws Exception {
        mockMvc.perform(put("/api/v1/notifications/1/mark-read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testMarkAsRead_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(put("/api/v1/notifications/1/mark-read"))
                .andExpect(status().isForbidden());
    }

    // ================== VALIDATION TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendNotification_MissingSubject_BadRequest() throws Exception {
        NotificationRequestDTO invalidRequest = NotificationRequestDTO.builder()
                .userId(1L)
                .type(NotificationType.EMAIL)
                .message("Test message")
                .recipient("test@example.com")
                .build();

        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendNotification_MissingRecipient_BadRequest() throws Exception {
        NotificationRequestDTO invalidRequest = NotificationRequestDTO.builder()
                .userId(1L)
                .type(NotificationType.EMAIL)
                .subject("Test Subject")
                .message("Test message")
                .build();

        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendEmail_InvalidEmail_BadRequest() throws Exception {
        EmailRequestDTO invalidRequest = EmailRequestDTO.builder()
                .to("invalid-email")
                .subject("Test")
                .message("Message")
                .build();

        mockMvc.perform(post("/api/v1/notifications/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendEmail_MissingSubject_BadRequest() throws Exception {
        EmailRequestDTO invalidRequest = EmailRequestDTO.builder()
                .to("test@example.com")
                .message("Message")
                .build();

        mockMvc.perform(post("/api/v1/notifications/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    // ================== EDGE CASE TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendNotification_LongMessage_Success() throws Exception {
        String longMessage = "A".repeat(1500); // Within 2000 char limit

        NotificationRequestDTO request = NotificationRequestDTO.builder()
                .userId(1L)
                .type(NotificationType.EMAIL)
                .subject("Long Message Test")
                .message(longMessage)
                .recipient("test@example.com")
                .build();

        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendNotification_WithReferenceData_Success() throws Exception {
        NotificationRequestDTO request = NotificationRequestDTO.builder()
                .userId(1L)
                .type(NotificationType.EMAIL)
                .subject("Test")
                .message("Test message")
                .recipient("test@example.com")
                .referenceType("CONSULTATION")
                .referenceId(123L)
                .build();

        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetUserNotifications_AsAdmin_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/user/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testMarkAsRead_AsAdmin_Success() throws Exception {
        mockMvc.perform(put("/api/v1/notifications/1/mark-read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ================== NOTIFICATION TYPE TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendNotification_EmailType_Success() throws Exception {
        NotificationRequestDTO request = NotificationRequestDTO.builder()
                .userId(1L)
                .type(NotificationType.EMAIL)
                .subject("Email Test")
                .message("Test email notification")
                .recipient("patient@example.com")
                .build();

        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.type").value("EMAIL"));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testSendNotification_SmsType_Success() throws Exception {
        NotificationRequestDTO request = NotificationRequestDTO.builder()
                .userId(1L)
                .type(NotificationType.SMS)
                .subject("SMS Test")
                .message("Test SMS notification")
                .recipient("+919876543210")
                .build();

        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }
}
