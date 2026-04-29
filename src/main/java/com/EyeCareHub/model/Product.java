package com.EyeCareHub.model;

import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Date;

@Document(collection = "products")
@NoArgsConstructor
public class Product {
    @Id
    private String id;

    @NotBlank
    private String name;

    @NotBlank
    private String category; // Eyeglasses, Sunglasses, Contact Lenses, Computer Glasses

    @NotBlank
    private String brand;

    @NotBlank
    private String gender; // Men, Women, Kids, Unisex

    @NotNull
    @Min(0)
    private Double price;

    @Min(0)
    private Double discount;

    private Double rating;

    private String description;

    private String imageUrl;

    @NotNull
    @Min(0)
    private Integer stock;

    @CreatedDate
    private Date createdAt;

    public Product(String name, String category, String brand, String gender, Double price, Double discount, Double rating, String description, String imageUrl, Integer stock) {
        this.name = name;
        this.category = category;
        this.brand = brand;
        this.gender = gender;
        this.price = price;
        this.discount = discount;
        this.rating = rating;
        this.description = description;
        this.imageUrl = imageUrl;
        this.stock = stock;
        this.createdAt = new Date();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getDiscount() {
        return discount;
    }

    public void setDiscount(Double discount) {
        this.discount = discount;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
