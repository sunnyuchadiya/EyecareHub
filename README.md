# 👁️ EyeCareHub - E-Commerce Platform

A comprehensive full-stack e-commerce web application for eyewear products built with **Spring Boot 3.4.2** and **MongoDB 8.0.4**. Features JWT authentication, role-based access control, shopping cart, order management, admin dashboard, Google OAuth integration, OTP verification, and coupon system.

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![Java](https://img.shields.io/badge/Java-25-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-green)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0.4-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 Project Overview

EyeCareHub is a modern e-commerce solution designed for selling eyewear products online. It provides a complete user journey from browsing products to placing orders, with advanced features like Google OAuth, OTP verification, coupon management, and comprehensive admin controls.

---

## 📌 Recent Update (April 25, 2026)

- Refreshed project documentation for easier onboarding.
- Revalidated local run flow for Java 25 + Spring Boot + MongoDB setup.
- Clarified quick-access URLs for frontend, admin panel, and API base.

---

## 🚀 Features

### 🛍️ Customer Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Google OAuth Integration**: One-click login with Google accounts
- **Forgot Password**: OTP-based password reset via email
- **Product Browsing**: Browse eyewear products with categories and filtering
- **Shopping Cart**: Add/remove items, update quantities, persistent cart data
- **Checkout**: Multiple payment options (COD, Card, PayPal)
- **Coupon System**: Apply discount coupons during checkout
- **Order Tracking**: View order history and track order status updates
- **User Dashboard**: Manage profile, addresses, and view past orders
- **Email Notifications**: OTP and password reset emails via SMTP

### 👨‍💼 Admin Features  
- **Admin Dashboard**: Overview of users, orders, and revenue statistics
- **User Management**: View all registered users with roles and details
- **Order Management**: View all orders, update order status (Pending → Processing → Shipped → Delivered)
- **Product Management**: View and manage products catalog
- **Coupon Management**: Create and manage discount coupons
- **Role-Based Access**: Secure admin-only routes with Spring Security
- **System Settings**: Configure application settings

### 🔐 Security
- **JWT Authentication**: Stateless authentication with Bearer tokens (24-hour expiry)
- **Password Encryption**: BCrypt hashing for secure password storage
- **Role-Based Authorization**: ROLE_USER and ROLE_ADMIN with @PreAuthorize
- **CORS Configuration**: Controlled cross-origin access
- **Session Persistence**: Token storage in localStorage and cookies
- **OTP Verification**: Secure email-based OTP for password reset
- **Google Token Verification**: Secure Google OAuth token validation

---

## 🛠️ Tech Stack

### Backend
- **Java 25 LTS** - Modern Java with latest features
- **Spring Boot 3.4.2** - Application framework
- **Spring Security 6.x** - Authentication and authorization
- **Spring Data MongoDB** - Database access layer
- **JWT (jjwt 0.12.5)** - Token-based authentication
- **Lombok 1.18.40** - Boilerplate code reduction
- **Spring Mail** - Email service for OTP and notifications
- **Google Auth Library** - OAuth token verification
- **Maven 3.8+** - Build and dependency management

### Frontend
- **HTML5/CSS3** - Semantic markup and responsive design
- **Vanilla JavaScript (ES6+)** - Client-side logic (no framework)
- **GSAP** - Advanced animations and UI effects
- **Font Awesome** - Icon library
- **Responsive Design** - Mobile-first approach

### Database
- **MongoDB 8.0.4** - NoSQL document database
- **Database Name**: `EyeCareHub`
- **Collections**: 
  - `users` - User accounts and profiles
  - `orders` - Order records and history
  - `carts` - Shopping cart data
  - `products` - Product catalog
  - `coupons` - Discount coupons
  - `otps` - OTP verification codes

### DevOps & Tools
- **Git** - Version control
- **Docker** - Containerization (optional)
- **Windows Batch Scripts** - Build and deployment automation
- **MongoDB Tools** - Data import/export utilities

---

## 📦 Installation

### Prerequisites
- **Java 25** (JDK)
- **MongoDB** (running on `localhost:27017`)
- **Maven** (3.8+)
- **MongoDB Database Tools** (mongoexport/mongoimport)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sem2project
   ```

2. **Configure MongoDB**
   - Ensure MongoDB is running on default port 27017
   - Database `EyeCareHub` will be created automatically

3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   # Option 1: Using Maven
   mvn spring-boot:run

   # Option 2: Using batch file (Windows)
   run_app.bat

   # Option 3: If compilation issues occur (Java 25 compatibility)
   mvn spring-boot:run -Dmaven.compiler.skip=true
   ```

5. **Create initial users**
   ```bash
   setup_database.bat
   ```

6. **Access the application**
   - Frontend: http://localhost:8080
   - Admin Dashboard: http://localhost:8080/admin/index.html
   - API Base: http://localhost:8080/api/v1

---

## 📚 Project Structure

```
sem2project/
├── src/
│   ├── main/
│   │   ├── java/com/EyeCareHub/
│   │   │   ├── config/          # Spring configuration classes
│   │   │   ├── controller/      # REST API endpoints
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── model/           # MongoDB document models
│   │   │   ├── repository/      # MongoDB repositories
│   │   │   ├── service/         # Business logic services
│   │   │   ├── security/        # JWT and security config
│   │   │   └── exception/       # Custom exceptions
│   │   └── resources/
│   │       ├── static/          # Frontend files
│   │       │   ├── admin/       # Admin dashboard
│   │       │   ├── pages/       # HTML pages
│   │       │   ├── js/          # JavaScript files
│   │       │   └── css/         # Stylesheets
│   │       └── application.properties
│   └── test/
│       └── java/                # Unit tests
├── pom.xml                      # Maven configuration
├── README.md                    # This file
├── QUICK_START_TESTING.md       # Testing guide
├── SESSION_FIX_DOCUMENTATION.md # Session fixes
└── PROJECT_TECH_DECISIONS_AND_LEARNINGS.txt
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/verify-otp` - Verify OTP for password reset
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/resend-otp` - Resend OTP code

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/{id}` - Get product details
- `GET /api/v1/products/category/{category}` - Get products by category

### Cart
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/update` - Update cart item quantity
- `DELETE /api/v1/cart/remove/{itemId}` - Remove item from cart
- `POST /api/v1/cart/clear` - Clear entire cart

### Orders
- `GET /api/v1/orders` - Get user's orders
- `POST /api/v1/orders/create` - Create new order
- `GET /api/v1/orders/{id}` - Get order details

### Coupons
- `POST /api/v1/coupons/validate` - Validate coupon code

### Admin
- `GET /api/v1/admin/users` - Get all users (Admin only)
- `GET /api/v1/admin/orders` - Get all orders (Admin only)
- `GET /api/v1/admin/statistics` - Get revenue statistics (Admin only)
- `PUT /api/v1/admin/orders/{id}/status` - Update order status (Admin only)
- `GET /api/v1/admin/coupons` - Get all coupons (Admin only)
- `POST /api/v1/admin/coupons` - Create new coupon (Admin only)

---

## 🧪 Testing

### Automated Testing
Test files have been provided in the resources directory:

```bash
# All tests in src/test/java/com/EyeCareHub/
cd sem2project
mvn test
```

### Manual Testing
1. **Frontend Testing**:
   - Access http://localhost:8080
   - Register a new account
   - Browse products
   - Test shopping cart functionality

2. **Admin Testing**:
   - Create admin account using `create_admin.bat`
   - Access http://localhost:8080/admin/index.html
   - Test order management and statistics

3. **API Testing**:
   - Use Postman for API endpoint testing
   - Use provided test script: `src/main/resources/static/test_admin.js`

For full testing details, see [QUICK_START_TESTING.md](QUICK_START_TESTING.md)

---

## 🐛 Troubleshooting

### Java 25 Compatibility Issues
If you encounter compilation errors:
```bash
# Skip Maven compiler and run directly
mvn spring-boot:run -Dmaven.compiler.skip=true
```

### MongoDB Connection Issues
- Ensure MongoDB is running on port 27017
- Check connection string in `application.properties`
- Verify database `EyeCareHub` exists

### Port 8080 Already in Use
```bash
# Change port in application.properties
server.port=8081
```

### Build Fails
```bash
# Clean build
mvn clean install

# Or using batch script
run_app.bat
```

For more issues, see [SESSION_FIX_DOCUMENTATION.md](SESSION_FIX_DOCUMENTATION.md)

---

## 📝 Important Configuration Files

### application.properties
Key configurations:
- `server.port=8080` - Application port
- `spring.data.mongodb.uri` - MongoDB connection string
- `eyecarehub.app.jwtSecret` - JWT secret key
- `eyecarehub.app.jwtExpirationMs` - JWT expiry (86400000 = 24 hours)
- `spring.mail.username/password` - Gmail SMTP credentials
- `google.oauth.client-id` - Google OAuth client ID

⚠️ **Security Warning**: 
- Do NOT commit sensitive credentials to git
- Use environment variables in production
- Rotate OAuth credentials regularly

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Submit pull request

---

## 📄 Documentation

- [QUICK_START_TESTING.md](QUICK_START_TESTING.md) - Quick testing guide
- [SESSION_FIX_DOCUMENTATION.md](SESSION_FIX_DOCUMENTATION.md) - Session and bug fixes
- [PROJECT_TECH_DECISIONS_AND_LEARNINGS.txt](PROJECT_TECH_DECISIONS_AND_LEARNINGS.txt) - Technical decisions
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database configuration guide

---

## 📊 Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "username": "string",
  "email": "string",
  "password": "bcrypt_hash",
  "roles": ["ROLE_USER", "ROLE_ADMIN"],
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Products Collection
```json
{
  "_id": ObjectId,
  "name": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "image": "url",
  "stock": number,
  "createdAt": ISODate
}
```

### Orders Collection
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "items": [
    {
      "productId": ObjectId,
      "quantity": number,
      "price": number
    }
  ],
  "status": "Pending|Processing|Shipped|Delivered",
  "totalAmount": number,
  "shippingAddress": "string",
  "paymentMethod": "string",
  "createdAt": ISODate
}
```

---

## 🚀 Deployment

### Local Deployment
```bash
# Build and run locally
mvn clean package
java -jar target/eyecarehub-0.0.1-SNAPSHOT.jar
```

### Docker Deployment (Optional)
```bash
# Build Docker image (Dockerfile needed)
docker build -t eyecarehub:latest .

# Run container
docker run -p 8080:8080 eyecarehub:latest
```

### Environment Variables (Production)
```bash
SPRING_DATA_MONGODB_URI=mongodb://user:pass@host:port/dbname
JWT_SECRET=your-secure-jwt-secret-key
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
GOOGLE_OAUTH_CLIENT_ID=your-client-id
```

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Author

Developed by the EyeCareHub Team

**Contact**: sunny130504@gmail.com

---

## 🙏 Acknowledgments

- Spring Boot Documentation
- MongoDB Documentation
- Google OAuth Documentation
- Community contributors and testers

---

## 📞 Support

For support, email sunny130504@gmail.com or open an issue on GitHub.

---

**Last Updated**: April 25, 2026
**Status**: Active Development ✅
   - Admin Panel: http://localhost:8080/admin/
   - API Base URL: http://localhost:8080/api

---

## 🔑 Default Credentials

After running `setup_database.bat`:

**Admin Account:**
- Email: `admin@eyecarehub.com`
- Password: `admin123`
- Access: Admin dashboard + all features

**Test User Account:**
- Email: `test@example.com`
- Password: `test123`
- Access: Customer features only

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signin` | User login | Public |
| POST | `/signup` | User registration | Public |
| GET | `/me` | Get current user | JWT |
| POST | `/logout` | User logout | JWT |

### Orders (`/api/orders`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/?paymentType={type}` | Place order | JWT |
| GET | `/` | Get user's orders | JWT |
| GET | `/all` | Get all orders (admin) | Admin |
| PUT | `/{id}/status?status={status}` | Update order status | Admin |

### Cart (`/api/cart`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get user's cart | JWT |
| POST | `/add` | Add item to cart | JWT |
| DELETE | `/remove/{productId}` | Remove item | JWT |
| PUT | `/update/{productId}` | Update quantity | JWT |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Get all users | Admin |
| DELETE | `/users/{id}` | Delete user (disabled) | Admin |

**Order Status Values:** `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

---

## 💾 Database Management

### Export Data (Backup)
```bash
export_data.bat
```
Creates JSON files in `mongodb_backup/`:
- `users.json` - All users
- `orders.json` - All orders  
- `carts.json` - Shopping carts
- `products.json` - Products

### Import Data (Restore)
```bash
import_data.bat
```
⚠️ **Warning:** This replaces existing data with backup files!

### Reset Database
```bash
# Drop database in MongoDB shell
use EyeCareHub
db.dropDatabase()

# Then create fresh users
setup_database.bat
```

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed guide.

---

## 📁 Project Structure

```
sem2project/
├── src/
│   ├── main/
│   │   ├── java/com/EyeCareHub/
│   │   │   ├── controller/          # REST API controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── OrderController.java
│   │   │   │   ├── CartController.java
│   │   │   │   └── AdminController.java
│   │   │   ├── service/             # Business logic
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── OrderService.java
│   │   │   │   └── CartServiceImpl.java
│   │   │   ├── repository/          # MongoDB repositories
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── OrderRepository.java
│   │   │   │   └── CartRepository.java
│   │   │   ├── model/               # Domain models
│   │   │   │   ├── User.java
│   │   │   │   ├── Order.java
│   │   │   │   ├── Cart.java
│   │   │   │   └── Role.java
│   │   │   ├── dto/                 # Data transfer objects
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── SignupRequest.java
│   │   │   │   └── CartItemDto.java
│   │   │   ├── security/            # Security configuration
│   │   │   │   ├── JwtAuthFilter.java
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   └── SecurityConfig.java
│   │   │   └── exception/           # Exception handling
│   │   │       └── ResourceNotFoundException.java
│   │   └── resources/
│   │       ├── application.properties   # Configuration
│   │       └── static/                  # Frontend files
│   │           ├── index.html
│   │           ├── css/
│   │           ├── js/
│   │           ├── pages/
│   │           └── admin/
│   └── test/                        # Unit tests
├── mongodb_backup/                  # Database backup files
├── pom.xml                          # Maven config
├── run_app.bat                      # Run application
├── export_data.bat                  # Export MongoDB data
├── import_data.bat                  # Import MongoDB data
├── setup_database.bat               # Initial setup
└── DATABASE_SETUP.md                # Database guide
```

---

## 🎨 Frontend Pages

### Public Pages
- `/` - Homepage
- `/pages/login.html` - Login
- `/pages/register.html` - Register  
- `/pages/categories.html` - Product categories
- `/pages/product.html` - Product details

### User Pages (Requires Login)
- `/pages/dashboard.html` - User dashboard
- `/pages/cart.html` - Shopping cart
- `/pages/checkout.html` - Checkout

### Admin Pages (Requires Admin Role)
- `/admin/index.html` - Admin dashboard
- `/admin/users.html` - User management
- `/admin/orders.html` - Order management
- `/admin/products.html` - Product catalog

---

## 🔧 Configuration

### Application Properties
Located at: `src/main/resources/application.properties`

```properties
# Server
server.port=8080

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/EyeCareHub
spring.data.mongodb.database=EyeCareHub

# JWT
app.jwt.secret=your-secret-key
app.jwt.expiration=604800000
```

### CORS Settings
Currently allows:
- `http://localhost:8080`
- `http://localhost:5500`
- `http://localhost:3000`

---

## 🧪 Testing

### Test Endpoints
```bash
# Run test script
test_endpoints.bat
```

### Manual Testing
```bash
# Register user
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"test123","roles":["user"]}'

# Login
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"test123"}'

# Get current user (replace TOKEN)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 🐛 Known Issues

### Java 25 Compatibility
- **Issue**: Maven/Gradle fail to compile new code with "Unsupported class file major version 69"
- **Workaround**: Use pre-compiled classes with `mvn spring-boot:run -Dmaven.compiler.skip=true`
- **Solution**: Consider downgrading to Java 17 or Java 21 for better tooling support

### User Deletion
- **Issue**: DELETE endpoint in AdminController not compiled due to Java 25 issues
- **Workaround**: Use MongoDB Compass or mongoimport/mongoexport for data management
- **Status**: Temporarily disabled in admin panel UI

---

## 📚 Dependencies

### Backend (pom.xml)
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-mongodb</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.5</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.32</version>
    </dependency>
</dependencies>
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is created for educational purposes as a semester project.

---

## 📞 Support

For issues and questions:
- Check [DATABASE_SETUP.md](DATABASE_SETUP.md) for database setup
- Review API endpoint documentation above
- Test with provided batch scripts

---

## 🎯 Future Enhancements

- [ ] Product CRUD operations in admin panel  
- [ ] Order cancellation feature
- [ ] Email notifications for order status
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Product reviews and ratings
- [ ] Search functionality
- [ ] Wishlist feature
- [ ] Product image upload
- [ ] Inventory management
- [ ] Sales analytics dashboard

---

## ⚡ Quick Start

```bash
# 1. Start MongoDB
net start MongoDB

# 2. Run application
run_app.bat

# 3. Setup database (first time only)
setup_database.bat

# 4. Open browser
start http://localhost:8080

# 5. Login as admin
# Email: admin@eyecarehub.com
# Password: admin123
```

---

**Built with ❤️ for Semester 2 Project**
