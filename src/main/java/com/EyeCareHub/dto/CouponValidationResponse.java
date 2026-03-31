package com.EyeCareHub.dto;

public class CouponValidationResponse {
    private boolean valid;
    private String code;
    private String message;
    private double discountAmount;
    private double amountBeforeDiscount;
    private double finalAmount;
    private int remainingUses;

    public CouponValidationResponse() {
    }

    public CouponValidationResponse(boolean valid, String code, String message, double discountAmount, 
                                   double amountBeforeDiscount, double finalAmount, int remainingUses) {
        this.valid = valid;
        this.code = code;
        this.message = message;
        this.discountAmount = discountAmount;
        this.amountBeforeDiscount = amountBeforeDiscount;
        this.finalAmount = finalAmount;
        this.remainingUses = remainingUses;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public double getAmountBeforeDiscount() {
        return amountBeforeDiscount;
    }

    public void setAmountBeforeDiscount(double amountBeforeDiscount) {
        this.amountBeforeDiscount = amountBeforeDiscount;
    }

    public double getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(double finalAmount) {
        this.finalAmount = finalAmount;
    }

    public int getRemainingUses() {
        return remainingUses;
    }

    public void setRemainingUses(int remainingUses) {
        this.remainingUses = remainingUses;
    }
}
