package com.EyeCareHub.dto;

public class ResendOTPRequest {
    private String email;

    public ResendOTPRequest() {
    }

    public ResendOTPRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
