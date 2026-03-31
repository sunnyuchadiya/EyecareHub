package com.EyeCareHub.controller;

import com.EyeCareHub.dto.CouponValidationResponse;
import com.EyeCareHub.security.services.UserDetailsImpl;
import com.EyeCareHub.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/validate")
    public ResponseEntity<CouponValidationResponse> validateCoupon(@RequestParam String code) {
        return ResponseEntity.ok(couponService.validateCouponForCheckout(getCurrentUserId(), code));
    }
}
