package com.telemedicine.notification.repository;

import com.telemedicine.notification.model.Notification;
import com.telemedicine.notification.model.NotificationStatus;
import com.telemedicine.notification.model.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserId(Long userId, Pageable pageable);

    Page<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status, Pageable pageable);

    Page<Notification> findByUserIdAndType(Long userId, NotificationType type, Pageable pageable);

    List<Notification> findByStatusAndCreatedAtBefore(NotificationStatus status, LocalDateTime dateTime);

    long countByUserIdAndStatus(Long userId, NotificationStatus status);
}
