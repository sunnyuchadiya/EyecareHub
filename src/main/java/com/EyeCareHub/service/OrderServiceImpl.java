package com.EyeCareHub.service;

import com.EyeCareHub.model.Cart;
import com.EyeCareHub.model.Coupon;
import com.EyeCareHub.model.Order;
import com.EyeCareHub.repository.OrderRepository;
import com.EyeCareHub.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private CouponService couponService;

    @Override
    @Transactional
    public Order placeOrder(String userId, String paymentType, String couponCode) {
        Cart cart = cartService.getCartByUserId(userId);
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        final double subtotal = cart.getTotalPrice() != null ? cart.getTotalPrice() : 0.0;
        final double taxAmount = Math.round(subtotal * 0.18d);
        final double amountBeforeDiscount = subtotal + taxAmount;

        double discountAmount = 0.0;
        String appliedCouponCode = null;

        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Coupon coupon = couponService.getValidCouponOrThrow(couponCode.trim());
            discountAmount = Math.min(amountBeforeDiscount, Math.max(0.0, coupon.getDiscountAmount()));
            appliedCouponCode = coupon.getCode();
            couponService.incrementUsage(coupon);
        }

        final double finalTotal = Math.max(0.0, amountBeforeDiscount - discountAmount);

        Order order = new Order(
                userId,
                cart.getItems(),
                subtotal,
                taxAmount,
                discountAmount,
                finalTotal,
                appliedCouponCode,
                "PENDING",
                paymentType
        );

        orderRepository.save(order);
        cartService.clearCart(userId);
        return order;
    }

    @Override
    public List<Order> getUserOrders(String userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order updateOrderStatus(String orderId, String status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(status);
            return orderRepository.save(order);
        }).orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }
}
