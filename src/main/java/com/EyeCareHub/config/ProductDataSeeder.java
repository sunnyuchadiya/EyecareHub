package com.EyeCareHub.config;

import com.EyeCareHub.model.Product;
import com.EyeCareHub.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductDataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public ProductDataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }

        List<Product> products = List.of(
            new Product(
                "Ray-Ban Aviator Classic",
                "Sunglasses",
                "Ray-Ban",
                "Unisex",
                13499.0,
                0.0,
                4.8,
                "Timeless aviator style with G-15 lenses.",
                "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1760&auto=format&fit=crop",
                15
            ),
            new Product(
                "Oakley Holbrook",
                "Sunglasses",
                "Oakley",
                "Unisex",
                12999.0,
                0.0,
                4.7,
                "Iconic American frame design.",
                "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1760&auto=format&fit=crop",
                15
            ),
            new Product(
                "Blue Cut Computer Glasses",
                "Computer Glasses",
                "Lenskart Air",
                "Unisex",
                3749.0,
                0.0,
                4.6,
                "Zero power blue light blocking lenses.",
                "https://i.pinimg.com/1200x/33/18/d9/3318d994a332e9a3253709ac9d8d897b.jpg",
                15
            ),
            new Product(
                "Tom Ford FT5634",
                "Eyeglasses",
                "Tom Ford",
                "Unisex",
                31499.0,
                0.0,
                4.9,
                "Luxury square acetate frames.",
                "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=1742&auto=format&fit=crop",
                15
            ),
            new Product(
                "Acuvue Oasys (6 Pack)",
                "Contact Lenses",
                "Johnson & Johnson",
                "Unisex",
                2999.0,
                0.0,
                4.8,
                "Hydraclear Plus technology for comfort.",
                "https://i.pinimg.com/736x/93/8b/0f/938b0f6716da3fc22111d22855f72db5.jpg",
                15
            ),
            new Product(
                "Wayfarer Matte Black",
                "Eyeglasses",
                "Vincent Chase",
                "Unisex",
                4999.0,
                0.0,
                4.5,
                "Classic matte finish for daily wear.",
                "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=1740&auto=format&fit=crop",
                15
            ),
            new Product(
                "Round Metal Gold",
                "Eyeglasses",
                "John Jacobs",
                "Unisex",
                6999.0,
                0.0,
                4.7,
                "Vintage inspired round metal frames.",
                "https://images.unsplash.com/photo-1508296695146-25e7b52a8f99?q=80&w=1740&auto=format&fit=crop",
                15
            ),
            new Product(
                "Anti-Glare Driving Glasses",
                "Sunglasses",
                "Polarix",
                "Unisex",
                4549.0,
                0.0,
                4.4,
                "Polarized lenses for night driving.",
                "https://i.pinimg.com/736x/5c/ca/e1/5ccae1b180f718b5327c281bb580ad63.jpg",
                15
            ),
            new Product(
                "Daily Disposables (30 Pack)",
                "Contact Lenses",
                "Bausch + Lomb",
                "Unisex",
                3749.0,
                0.0,
                4.6,
                "Fresh pair for every new day.",
                "https://i.pinimg.com/1200x/6f/5d/fb/6f5dfbd218ff39c61b0a95d08361f95f.jpg",
                15
            ),
            new Product(
                "Transparent Acetate Frames",
                "Computer Glasses",
                "Lenskart Air",
                "Unisex",
                4149.0,
                0.0,
                4.7,
                "Crystal clear frames with blue cut.",
                "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?q=80&w=1740&auto=format&fit=crop",
                15
            )
        );

        productRepository.saveAll(products);
    }
}