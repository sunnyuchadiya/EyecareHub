package com.EyeCareHub.security.jwt;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Utility class to verify and decode Google JWT tokens
 */
@Component
public class GoogleJwtVerifier {
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/tokeninfo";
    private static final String ISSUER_1 = "https://accounts.google.com";
    private static final String ISSUER_2 = "accounts.google.com";

    @Value("${google.oauth.client-id}")
    private String expectedClientId;

    /**
     * Verify and decode Google JWT token
     */
    public GoogleTokenPayload verifyAndDecodeToken(String token) {
        try {
            String verifyUrl = GOOGLE_TOKEN_URL + "?id_token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
            JsonObject jsonObject;

            try (InputStreamReader reader = new InputStreamReader(new URL(verifyUrl).openStream(), StandardCharsets.UTF_8)) {
                jsonObject = JsonParser.parseReader(reader).getAsJsonObject();
            }

            if (jsonObject.has("error_description")) {
                throw new IllegalArgumentException("Invalid Google token: " + jsonObject.get("error_description").getAsString());
            }

            validateAudience(jsonObject);
            validateIssuer(jsonObject);

            // Create payload object
            GoogleTokenPayload tokenPayload = new GoogleTokenPayload();
            tokenPayload.setSub(jsonObject.get("sub").getAsString());
            tokenPayload.setEmail(jsonObject.get("email").getAsString());
            tokenPayload.setEmailVerified(jsonObject.get("email_verified").getAsBoolean());
            tokenPayload.setName(jsonObject.has("name") ? jsonObject.get("name").getAsString() : "");
            tokenPayload.setPicture(jsonObject.has("picture") ? jsonObject.get("picture").getAsString() : "");

            return tokenPayload;
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage());
        }
    }

    private void validateAudience(JsonObject jsonObject) {
        if (!jsonObject.has("aud")) {
            throw new IllegalArgumentException("Google token missing audience");
        }

        String audience = jsonObject.get("aud").getAsString();
        if (!expectedClientId.equals(audience)) {
            throw new IllegalArgumentException("Google token audience mismatch");
        }
    }

    private void validateIssuer(JsonObject jsonObject) {
        if (!jsonObject.has("iss")) {
            throw new IllegalArgumentException("Google token missing issuer");
        }

        String issuer = jsonObject.get("iss").getAsString();
        if (!ISSUER_1.equals(issuer) && !ISSUER_2.equals(issuer)) {
            throw new IllegalArgumentException("Google token issuer is invalid");
        }
    }

    /**
     * Google Token Payload
     */
    public static class GoogleTokenPayload {
        private String sub;
        private String email;
        private boolean emailVerified;
        private String name;
        private String picture;

        // Getters and Setters
        public String getSub() { return sub; }
        public void setSub(String sub) { this.sub = sub; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public boolean isEmailVerified() { return emailVerified; }
        public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPicture() { return picture; }
        public void setPicture(String picture) { this.picture = picture; }
    }
}
