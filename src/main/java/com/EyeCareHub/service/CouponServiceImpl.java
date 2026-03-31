package com.EyeCareHub.service;

import com.EyeCareHub.dto.CouponValidationResponse;
import com.EyeCareHub.exception.ResourceNotFoundException;
import com.EyeCareHub.model.Cart;
import com.EyeCareHub.model.Coupon;
import com.EyeCareHub.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CouponServiceImpl implements CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CartService cartService;

    @Override
    public Coupon getValidCouponOrThrow(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new RuntimeException("Coupon code is required");
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid coupon code"));

        validateCouponBusinessRules(coupon);
        return coupon;
    }

    @Override
    public void incrementUsage(Coupon coupon) {
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    @Override
    public CouponValidationResponse validateCouponForCheckout(String userId, String code) {
        Coupon coupon = getValidCouponOrThrow(code);

        Cart cart = cartService.getCartByUserId(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        double subtotal = cart.getTotalPrice() != null ? cart.getTotalPrice() : 0.0;
        double taxAmount = Math.round(subtotal * 0.18d);
        double amountBeforeDiscount = subtotal + taxAmount;
        double discountAmount = Math.min(amountBeforeDiscount, Math.max(0.0, coupon.getDiscountAmount()));
        double finalAmount = Math.max(0.0, amountBeforeDiscount - discountAmount);
        int remainingUses = Math.max(0, coupon.getMaxUses() - coupon.getUsedCount());

        return new CouponValidationResponse(
                true,
                coupon.getCode(),
                "Coupon applied successfully",
                discountAmount,
                amountBeforeDiscount,
                finalAmount,
                remainingUses
        );
    }

    private void validateCouponBusinessRules(Coupon coupon) {
        if (!coupon.isActive()) {
            throw new RuntimeException("Coupon is inactive");
        }

        if (coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new RuntimeException("Coupon usage limit reached");
        }

        LocalDateTime now = LocalDateTime.now();

        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new RuntimeException("Coupon is not active yet");
        }

        if (coupon.getExpiryDate() != null && now.isAfter(coupon.getExpiryDate())) {
            throw new RuntimeException("Coupon has expired");
        }
    }
}
