package com.EyeCareHub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String mailFrom;

    /**
     * Send OTP via email
     */
    public void sendOTP(String email, String otp) {
        try {
            logger.info("Generating OTP email for {}", email);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(email);
            message.setSubject("EyeCareHub - Email Verification Code");
            message.setText(buildOTPEmailBody(otp));

            javaMailSender.send(message);
            logger.info("OTP email sent successfully to {}", email);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to {}: {}", email, e.getMessage());
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    /**
     * Build email body for OTP
     */
    private String buildOTPEmailBody(String otp) {
        return "Hello,\n\n" +
                "Your EyeCareHub email verification code is:\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                otp + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "This code will expire in 5 minutes.\n\n" +
                "If you didn't request this code, please ignore this email.\n\n" +
                "Thank you,\n" +
                "EyeCareHub Team";
    }

    /**
     * Send welcome email
     */
    public void sendWelcomeEmail(String email, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(email);
            message.setSubject("Welcome to EyeCareHub!");
            message.setText("Hello " + username + ",\n\n" +
                    "Welcome to EyeCareHub! Your account has been successfully created.\n\n" +
                    "Thank you for joining us.\n\n" +
                    "Best regards,\n" +
                    "EyeCareHub Team");
            
            javaMailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send welcome email to {}: {}", email, e.getMessage());
        }
    }
}
