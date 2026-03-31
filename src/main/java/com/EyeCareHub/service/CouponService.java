package com.EyeCareHub.service;

import com.EyeCareHub.dto.CouponValidationResponse;
import com.EyeCareHub.model.Coupon;

public interface CouponService {
    Coupon getValidCouponOrThrow(String code);
    void incrementUsage(Coupon coupon);
    CouponValidationResponse validateCouponForCheckout(String userId, String code);
}
