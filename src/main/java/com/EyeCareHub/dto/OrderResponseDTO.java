package com.EyeCareHub.dto;

import java.util.Date;

public class OrderResponseDTO {

    private String id;
    private String userName;
    private Double totalPrice;
    private String status;
    private Date createdAt;

    public OrderResponseDTO(String id, String userName, Double totalPrice, String status, Date createdAt) {
        this.id = id;
        this.userName = userName;
        this.totalPrice = totalPrice;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getUserName() { return userName; }
    public Double getTotalPrice() { return totalPrice; }
    public String getStatus() { return status; }
    public Date getCreatedAt() { return createdAt; }
}