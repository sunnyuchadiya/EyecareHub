package com.EyeCareHub.service;

import com.EyeCareHub.model.User;
import com.EyeCareHub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

/**
 * OTP Service for generating, sending, and verifying OTPs
 */
@Service
public class OTPService {
    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;

    /**
     * Generate OTP and send to user email
     */
    public void generateAndSendOTP(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Generate OTP
        String otp = generateOTP();
        
        // Set OTP and expiry
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
        user.setOtpAttempts(0);
        
        userRepository.save(user);

        // Send OTP via email
        emailService.sendOTP(email, otp);
    }

    /**
     * Verify OTP
     */
    public void verifyOTP(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Check if OTP attempts exceeded
        if (user.getOtpAttempts() >= MAX_ATTEMPTS) {
            throw new RuntimeException("Too many failed OTP attempts. Please request a new OTP.");
        }

        // Check if OTP expired
        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        // Check if OTP matches
        if (!user.getOtp().equals(otp)) {
            user.setOtpAttempts(user.getOtpAttempts() + 1);
            userRepository.save(user);
            throw new RuntimeException("Invalid OTP. Please try again.");
        }

        // Mark email as verified
        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setOtpAttempts(0);
        
        userRepository.save(user);
    }

    /**
     * Generate random 6-digit OTP
     */
    private String generateOTP() {
        Random random = new Random();
        int otpValue = 100000 + random.nextInt(900000);
        return String.valueOf(otpValue);
    }
}
