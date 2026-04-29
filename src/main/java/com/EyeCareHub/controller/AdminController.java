package com.EyeCareHub.controller;

import com.EyeCareHub.dto.MessageResponse;
import com.EyeCareHub.model.Coupon;
import com.EyeCareHub.model.Order;
import com.EyeCareHub.model.Product;
import com.EyeCareHub.model.User;
import com.EyeCareHub.repository.CouponRepository;
import com.EyeCareHub.repository.UserRepository;
import com.EyeCareHub.repository.OrderRepository;
import com.EyeCareHub.repository.ProductRepository;
import com.EyeCareHub.service.OrderService;
import com.EyeCareHub.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CouponRepository couponRepository;

    @Autowired
    ProductService productService;

    @Autowired
    OrderService orderService;

    // ============ USER MANAGEMENT ============

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            new MessageResponse("User not found with id: " + userId)
        );
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new MessageResponse("User not found with id: " + userId)
            );
        }
        userRepository.deleteById(userId);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }

    @PutMapping("/users/{userId}/block")
    public ResponseEntity<?> toggleUserBlockStatus(
            @PathVariable String userId,
            @RequestParam(required = false) Boolean block,
            @RequestBody(required = false) Map<String, Object> body) {
        Boolean desiredState = resolveBlockState(block, body);
        if (desiredState == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Missing block status. Provide query param 'block' or JSON body { block: true/false }"));
        }
        return updateUserBlockedState(userId, desiredState);
    }

    @PatchMapping("/users/{userId}/blocked")
    public ResponseEntity<?> patchUserBlockedStatus(@PathVariable String userId, @RequestBody(required = false) Map<String, Object> body) {
        Boolean desiredState = resolveBlockState(null, body);
        if (desiredState == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Missing block status. Provide JSON body { blocked: true/false }"));
        }
        return updateUserBlockedState(userId, desiredState);
    }

    private Boolean resolveBlockState(Boolean queryBlock, Map<String, Object> body) {
        if (queryBlock != null) {
            return queryBlock;
        }
        if (body == null) {
            return null;
        }

        Object blockValue = body.containsKey("block") ? body.get("block") : body.get("blocked");
        if (blockValue instanceof Boolean) {
            return (Boolean) blockValue;
        }
        if (blockValue instanceof String) {
            return Boolean.parseBoolean((String) blockValue);
        }
        return null;
    }

    private ResponseEntity<?> updateUserBlockedState(String userId, boolean block) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found with id: " + userId));
        }

        User user = userOpt.get();
        user.setBlocked(block);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User " + (block ? "blocked" : "unblocked") + " successfully"));
    }

    // ============ PRODUCT MANAGEMENT ============

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            return new ResponseEntity<>(product.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        return new ResponseEntity<>(productService.createProduct(product), HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @Valid @RequestBody Product product) {
        Product updatedProduct = productService.updateProduct(id, product);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new MessageResponse("Product not found with id: " + id)
            );
        }
        productService.deleteProduct(id);
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully"));
    }

    // ============ COUPON MANAGEMENT ============

    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }

    @GetMapping("/coupons/{id}")
    public ResponseEntity<?> getCouponById(@PathVariable String id) {
        return couponRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Coupon not found with id: " + id)));
    }

    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            System.out.println("=== CREATE COUPON DEBUG ===");
            System.out.println("Received coupon code: " + coupon.getCode());
            System.out.println("Received startDate (raw): " + coupon.getStartDate());
            System.out.println("Received expiryDate (raw): " + coupon.getExpiryDate());
            System.out.println("Received discountAmount: " + coupon.getDiscountAmount());
            System.out.println("Received maxUses: " + coupon.getMaxUses());
            
            if (coupon.getCode() == null || coupon.getCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Coupon code is required"));
            }
            final String normalizedCode = coupon.getCode().trim().toUpperCase();
            if (couponRepository.findByCodeIgnoreCase(normalizedCode).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponse("Coupon code already exists"));
            }

            coupon.setCode(normalizedCode);
            if (coupon.getUsedCount() < 0) coupon.setUsedCount(0);
            if (coupon.getMaxUses() <= 0) coupon.setMaxUses(1);
            if (coupon.getDiscountAmount() < 0) coupon.setDiscountAmount(0.0);
            if (coupon.getUsedCount() > coupon.getMaxUses()) coupon.setUsedCount(coupon.getMaxUses());
            if (coupon.getStartDate() != null && coupon.getExpiryDate() != null
                    && coupon.getStartDate().isAfter(coupon.getExpiryDate())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Start date must be before expiry date"));
            }

            System.out.println("About to save coupon: " + coupon.getCode());
            Coupon saved = couponRepository.save(coupon);
            System.out.println("Coupon saved successfully with ID: " + saved.getId());
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("ERROR creating coupon: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Unable to save coupon: " + e.getMessage()));
        }
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable String id, @RequestBody Coupon coupon) {
        try {
            Optional<Coupon> existingOpt = couponRepository.findById(id);
            if (existingOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Coupon not found with id: " + id));
            }

            Coupon existing = existingOpt.get();
            String normalizedCode = coupon.getCode() == null ? existing.getCode() : coupon.getCode().trim().toUpperCase();
            Optional<Coupon> duplicateCode = couponRepository.findByCodeIgnoreCase(normalizedCode);
            if (duplicateCode.isPresent() && !duplicateCode.get().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponse("Coupon code already exists"));
            }

            int maxUses = Math.max(1, coupon.getMaxUses());
            int usedCount = Math.max(0, coupon.getUsedCount());
            if (usedCount > maxUses) usedCount = maxUses;
            if (coupon.getStartDate() != null && coupon.getExpiryDate() != null
                    && coupon.getStartDate().isAfter(coupon.getExpiryDate())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Start date must be before expiry date"));
            }

            existing.setCode(normalizedCode);
            existing.setDiscountAmount(Math.max(0.0, coupon.getDiscountAmount()));
            existing.setMaxUses(maxUses);
            existing.setUsedCount(usedCount);
            existing.setStartDate(coupon.getStartDate());
            existing.setExpiryDate(coupon.getExpiryDate());
            existing.setActive(coupon.isActive());

            return ResponseEntity.ok(couponRepository.save(existing));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Unable to update coupon: " + e.getMessage()));
        }
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable String id) {
        if (!couponRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Coupon not found with id: " + id));
        }
        couponRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Coupon deleted successfully"));
    }

    // ============ ORDER MANAGEMENT ============

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable String id) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            return ResponseEntity.ok(order.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            new MessageResponse("Order not found with id: " + id)
        );
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestParam String status) {
        try {
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new MessageResponse("Error updating order: " + e.getMessage())
            );
        }
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable String id) {
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new MessageResponse("Order not found with id: " + id)
            );
        }
        orderRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Order deleted successfully"));
    }

    // ============ DASHBOARD STATS ============

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            long totalUsers = userRepository.count();
            long totalProducts = productRepository.count();
            long totalOrders = orderRepository.count();

            return ResponseEntity.ok(new MessageResponse(
                "totalUsers:" + totalUsers + ",totalProducts:" + totalProducts + ",totalOrders:" + totalOrders
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new MessageResponse("Error fetching stats: " + e.getMessage())
            );
        }
    }
}
