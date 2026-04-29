# 👁️ EyeCareHub - E-Commerce Platform

EyeCareHub is a full-stack e-commerce web application for eyewear products built with Spring Boot and MongoDB. It includes JWT authentication, OTP-based account verification and password reset, Google sign-in, coupon support, shopping cart, order management, and a full admin dashboard.

---

## 🚀 Features

### 🛍️ Customer Features
- Secure registration and login with JWT tokens
- Email-based OTP verification, resend OTP, and password reset flows
- Google login and signup using backend token verification
- Product browsing with categories, search, and price filtering
- Shopping cart with add, remove, and quantity update actions
- Checkout with optional coupon code support
- Order history and order status tracking

### 👨‍💼 Admin Features
- Admin dashboard with summary stats for users, products, and orders
- View, delete, and block or unblock users
- Create, update, and delete products
- Create, update, and delete coupons
- View all orders and update order status

### 🔐 Security
- Stateless JWT authentication
- BCrypt password hashing
- ROLE_USER and ROLE_ADMIN authorization
- SMTP-based OTP delivery for registration and password reset
- Google OAuth token verification on the backend

---

## 🛠️ Tech Stack

### Backend
- Java 25
- Spring Boot 3.4.2
- Spring Security
- Spring Data MongoDB
- JWT (jjwt 0.12.5)
- Lombok 1.18.40
- Spring Mail
- Maven

### Frontend
- HTML5 / CSS3
- Vanilla JavaScript
- GSAP for animations
- Font Awesome for icons

### Database
- MongoDB 8.0.4
- Database name: `EyeCareHub`

---

## 📦 Installation

### Prerequisites
- Java 25 (JDK)
- MongoDB running on `localhost:27017`
- Maven 3.8+

### Setup Steps

1. Clone the repository.
   ```bash
   git clone <repository-url>
   cd sem2project
   ```

2. Configure MongoDB.
   - Ensure MongoDB is running on the default port.
   - The `EyeCareHub` database will be created automatically.

3. Build the project.
   ```bash
   mvn clean install
   ```

4. Run the application.
   ```bash
   # Option 1: Using Maven
   mvn spring-boot:run

   # Option 2: Windows batch script
   run_app.bat

   # Option 3: PowerShell helper
   start_spring_boot.ps1

   # Option 4: Logging helper
   node run_and_log.js

   # Option 5: If compilation issues occur
   mvn spring-boot:run -Dmaven.compiler.skip=true
   ```

5. Create initial users.
   ```bash
   setup_database.bat
   ```

6. Access the application.
   - Frontend: http://localhost:8080
   - Admin Dashboard: http://localhost:8080/admin/index.html
   - API Base: http://localhost:8080/api

---

## 🔑 Default Credentials

After running `setup_database.bat`:

**Admin Account**
- Email: `admin@eyecarehub.com`
- Password: `admin123`

**Test User Account**
- Email: `test@example.com`
- Password: `test123`

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /signin` - User login
- `POST /signup` - User registration
- `POST /google/login` - Google login using token
- `POST /google/signup` - Google signup using token
- `POST /verify-otp` - Verify registration OTP
- `POST /resend-otp` - Resend registration OTP
- `POST /forgot-password` - Request password reset OTP
- `POST /reset-password` - Reset password with OTP
- `GET /me` - Get current user
- `POST /logout` - Logout current user

### Products (`/api/products`)
- `GET /` - Get all products
- `GET /{id}` - Get product details
- `GET /category/{category}` - Get products by category
- `GET /search?name=` - Search products by name
- `GET /filter?min=&max=` - Filter products by price range

### Cart (`/api/cart`)
- `GET /` - Get user's cart
- `POST /add` - Add item to cart
- `PUT /update/{productId}` - Update cart item quantity
- `DELETE /remove/{productId}` - Remove item from cart

### Orders (`/api/orders`)
- `POST /?paymentType={type}&couponCode={code}` - Create new order
- `GET /` - Get user's orders
- `GET /all` - Get all orders for admin
- `PUT /{id}/status?status={status}` - Update order status for admin

### Coupons (`/api/coupons`)
- `GET /validate?code=` - Validate coupon code

### Admin (`/api/admin`)
- `GET /users` - Get all users
- `DELETE /users/{id}` - Delete user
- `PUT /users/{id}/block?block={true|false}` - Block or unblock user
- `GET /products` - Get all products
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product
- `GET /coupons` - Get all coupons
- `POST /coupons` - Create coupon
- `PUT /coupons/{id}` - Update coupon
- `DELETE /coupons/{id}` - Delete coupon
- `GET /orders` - Get all orders
- `PUT /orders/{id}/status?status={status}` - Update order status
- `GET /dashboard-stats` - Get dashboard stats

---

## 📁 Project Structure

```
sem2project/
├── src/main/java/com/EyeCareHub/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── model/
│   ├── repository/
│   ├── security/
│   └── service/
├── src/main/resources/
│   ├── application.properties
│   └── static/
│       ├── admin/
│       ├── css/
│       ├── js/
│       └── pages/
├── mongodb_backup/
├── pom.xml
├── run_app.bat
├── run_and_log.js
├── start_spring_boot.ps1
└── DATABASE_SETUP.md
```

---

## 🎨 Frontend Pages

### Public Pages
- `/` - Homepage
- `/pages/login.html` - Login
- `/pages/register.html` - Register
- `/pages/forgot-password.html` - Password reset request
- `/pages/verify-otp.html` - OTP verification
- `/pages/categories.html` - Product categories
- `/pages/product.html` - Product details

### User Pages
- `/pages/dashboard.html` - User dashboard
- `/pages/cart.html` - Shopping cart
- `/pages/checkout.html` - Checkout

### Admin Pages
- `/admin/index.html` - Admin dashboard
- `/admin/users.html` - User management
- `/admin/orders.html` - Order management
- `/admin/products.html` - Product management
- `/admin/coupons.html` - Coupon management
- `/admin/settings.html` - Admin settings

---

## 💾 Database Management

### Export Data
```bash
export_data.bat
```

### Import Data
```bash
import_data.bat
```

### Reset Database
```bash
use EyeCareHub
db.dropDatabase()
setup_database.bat
```

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for the full setup guide.