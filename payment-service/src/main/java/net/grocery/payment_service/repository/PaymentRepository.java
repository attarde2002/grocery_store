package net.grocery.payment_service.repository;

import net.grocery.payment_service.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {
}