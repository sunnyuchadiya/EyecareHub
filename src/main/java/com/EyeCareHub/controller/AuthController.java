package com.EyeCareHub.controller;

import com.EyeCareHub.dto.*;
import com.EyeCareHub.service.AuthService;
import com.EyeCareHub.service.GoogleAuthService;
import com.EyeCareHub.service.OTPService;
import com.EyeCareHub.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthService authService;

    @Autowired
    GoogleAuthService googleAuthService;

    @Autowired
    OTPService otpService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse response = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            authService.registerUser(signUpRequest);
            return ResponseEntity.ok(new MessageResponse("User registered successfully! Check your email for OTP."));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/google/login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest request) {
        try {
            JwtResponse response = googleAuthService.handleGoogleLogin(request.getToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/google/signup")
    public ResponseEntity<?> googleSignup(@RequestBody GoogleAuthRequest request) {
        try {
            JwtResponse response = googleAuthService.handleGoogleSignup(request.getToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody OTPVerificationRequest request) {
        try {
            otpService.verifyOTP(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(new MessageResponse("Email verified successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOTP(@RequestBody ResendOTPRequest request) {
        try {
            otpService.generateAndSendOTP(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("OTP sent to " + request.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            authService.sendPasswordResetOTP(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("If the email exists, a reset OTP has been sent."));
        } catch (Exception e) {
            return ResponseEntity.ok(new MessageResponse("If the email exists, a reset OTP has been sent."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Password reset successful! Please login again."));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return ResponseEntity.ok(userDetails);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new MessageResponse("Not authenticated"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new MessageResponse("Logged out successfully!"));
    }
}
