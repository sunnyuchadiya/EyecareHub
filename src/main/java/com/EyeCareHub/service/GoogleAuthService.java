package com.EyeCareHub.service;

import com.EyeCareHub.dto.JwtResponse;
import com.EyeCareHub.model.Role;
import com.EyeCareHub.model.User;
import com.EyeCareHub.repository.UserRepository;
import com.EyeCareHub.security.jwt.GoogleJwtVerifier;
import com.EyeCareHub.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Google Authentication Service
 */
@Service
public class GoogleAuthService {
    @Autowired
    private GoogleJwtVerifier googleJwtVerifier;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private OTPService otpService;

    /**
     * Handle Google Login
     * Verifies Google JWT and logs in the user
     */
    public JwtResponse handleGoogleLogin(String googleToken) {
        try {
            // Verify and decode Google JWT
            GoogleJwtVerifier.GoogleTokenPayload payload = googleJwtVerifier.verifyAndDecodeToken(googleToken);

            // Find or create user
            User user = userRepository.findByEmail(payload.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found. Please sign up first."));

            // Check if user is blocked
            if (user.isBlocked()) {
                throw new RuntimeException("User account is blocked.");
            }

            // Generate JWT token
            String jwt = generateJwtToken(user);

            // Get user roles
            List<String> roles = user.getRoles().stream()
                    .map(Role::toString)
                    .collect(Collectors.toList());

            return new JwtResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    roles
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to authenticate with Google: " + e.getMessage());
        }
    }

    /**
     * Handle Google Signup
     * Verifies Google JWT and creates a new user
     */
    public JwtResponse handleGoogleSignup(String googleToken) {
        try {
            // Verify and decode Google JWT
            GoogleJwtVerifier.GoogleTokenPayload payload = googleJwtVerifier.verifyAndDecodeToken(googleToken);

            // Check if email already exists
            if (userRepository.existsByEmail(payload.getEmail())) {
                throw new RuntimeException("Email is already registered. Please login instead.");
            }

            // Create new user
            User user = new User();
            user.setEmail(payload.getEmail());
            user.setUsername(payload.getName().isEmpty() ? payload.getEmail().split("@")[0] : payload.getName());
            user.setPassword(encoder.encode("GOOGLE_AUTH_" + System.currentTimeMillis())); // Dummy password
            user.setEmailVerified(payload.isEmailVerified());
            
            // Set default role
            Set<Role> roles = new HashSet<>();
            roles.add(Role.ROLE_USER);
            user.setRoles(roles);

            userRepository.save(user);

            // Generate JWT token
            String jwt = generateJwtToken(user);

            // Get user roles
            List<String> userRoles = user.getRoles().stream()
                    .map(Role::toString)
                    .collect(Collectors.toList());

            return new JwtResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    userRoles
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign up with Google: " + e.getMessage());
        }
    }

    /**
     * Generate JWT token for user
     */
    private String generateJwtToken(User user) {
        // Create authentication token
        UsernamePasswordAuthenticationToken token = 
                new UsernamePasswordAuthenticationToken(user.getUsername(), null);
        
        SecurityContextHolder.getContext().setAuthentication(token);
        
        return jwtUtils.generateJwtTokenFromUsername(user.getUsername());
    }
}
