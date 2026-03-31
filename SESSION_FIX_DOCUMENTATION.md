# Session Management & Admin CRUD - Implementation Guide

## Overview
Fixed session management issues and added complete admin dashboard for managing products, users, and orders through the backend API.

---

## Problems Solved

### 1. **Session Management Issue**
**Problem**: Users had to re-login after placing orders. Sessions were not persisting.

**Root Cause**: 
- Frontend was using dummy localStorage-based authentication
- JWT tokens were not being stored or sent with API requests
- Backend API calls lacked Authorization headers

**Solution Implemented**:
- Created `api.js` utility for centralized API management
- Implemented JWT token storage in localStorage
- Added Authorization headers to all API requests
- Updated frontend auth flow to call backend endpoints

---

## Changes Made

### 1. **Frontend Authentication Fix** (/js)

#### **New File: `api.js`**
- Centralized API management utility
- JWT token storage and retrieval
- All API endpoints wrapped with authentication
- Automatic 401 handling (redirects to login on expired token)
- Functions available:
  - `authAPI.login()` / `authAPI.signup()` / `authAPI.logout()`
  - `productAPI.*` (CRUD operations)
  - `orderAPI.*` (place order, get orders)
  - `cartAPI.*` (manage shopping cart)
  - `adminAPI.*` (admin operations)

#### **Updated: `auth.js`**
- Replaced dummy login with actual `authAPI.login()` call
- Now stores JWT token via `storeToken()`
- All subsequent requests automatically include token
- Proper error handling with user feedback
- Added `logout()` function

#### **Updated: `cart.js`**
- Changed checkout to call `orderAPI.placeOrder()` instead of localStorage
- Order is now created on backend and saved to database
- Users remain logged in through session
- Order confirmation shows actual order ID from backend

### 2. **Backend API Enhancement** (Java)

#### **Enhanced: `AdminController.java`**
Complete admin endpoints for:
- **Users Management**: Get all, Get by ID, Delete
- **Products Management**: Get all, Get by ID, Create, Update, Delete
- **Orders Management**: Get all, Get by ID, Update status, Delete
- **Dashboard Stats**: Get total users, products, orders

All endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`

### 3. **Admin Dashboard Update** (/admin)

#### **Updated: `admin/js/admin.js`**
- Replaced all localStorage mock data with API calls
- Real-time data loading from backend
- Full CRUD functionality:
  - **Users**: View and delete users
  - **Products**: View, create, edit, and delete products
  - **Orders**: View, update status, and delete orders
- Admin access verification (checks ROLE_ADMIN)
- Proper error handling and user feedback

#### **Updated: Admin HTML Pages**
- `index.html` - Dashboard with live stats
- `users.html` - User management table
- `products.html` - Product management with add/edit modal
- `orders.html` - Order management with status tracking
- All pages now include `api.js` script before `admin.js`

---

## How to Test

### **1. User Registration & Login**
1. Navigate to `/pages/register.html`
2. Create a new account with username, email, and password
3. JWT token is automatically stored upon successful login
4. Token persists across page navigations

### **2. Shopping & Orders**
1. Login as a regular user
2. Add products to cart
3. Go to checkout and place order
4. **Session persists** - No re-login required!
5. Order is saved to database with:
   - Order ID, User ID, Items, Total Price, Order Date
   - Payment Type, Order Status

### **3. Admin Dashboard**
1. Login with admin account (or create user with admin role in database)
2. Navigate to `/admin/index.html`
3. Access admin panel:
   - **Dashboard**: View total users, products, and orders
   - **Users**: See all users, delete users
   - **Products**: View all products, add new product, edit existing, delete
   - **Orders**: View all orders, update order status (Pending→Processing→Shipped→Delivered)

### **4. Dynamic Data Management**
- All data in admin panel is now fetched from backend
- Products can be managed (add/edit/delete) and changes persist
- Users can be managed
- Orders can be tracked with status updates

---

## API Endpoints

### **Authentication** (`/api/auth`)
- `POST /sign in` - User login (returns JWT token)
- `POST /signup` - User registration
- `GET /me` - Get current user info
- `POST /logout` - Logout

### **Products** (`/api/products`)
- `GET /` - Get all products
- `GET /{id}` - Get product by ID
- `POST /` - Create product (admin only)
- `PUT /{id}` - Update product (admin only)
- `DELETE /{id}` - Delete product (admin only)

### **Orders** (`/api/orders`)
- `POST /` - Place order
- `GET /` - Get user's orders
- `GET /all` - Get all orders (admin only)
- `PUT /{id}/status` - Update order status (admin only)

### **Admin** (`/api/admin`)
- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID
- `DELETE /users/{id}` - Delete user
- `GET /products` - Get all products
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product
- `GET /orders` - Get all orders
- `POST /orders/{id}/status` - Update order status
- `DELETE /orders/{id}` - Delete order
- `GET /dashboard-stats` - Get dashboard statistics

---

## How It Works - Session Flow

```
1. User Login:
   Frontend: POST /auth/signin with credentials
   Backend: Returns JWT token
   Frontend: stores token in localStorage via storeToken()

2. Subsequent API Calls:
   Frontend: Includes Authorization header with "Bearer {token}"
   Backend: AuthTokenFilter validates JWT and sets Security Context
   Response: User context available throughout request

3. Order Placement:
   Frontend: POST /orders with paymentType
   Backend: Extracts userId from Security Context
   Process: Create order, save to database
   Frontend: Session persists, user stays logged in

4. Admin Operations:
   Frontend: Checks localStorage for ROLE_ADMIN
   All API calls include JWT token
   Backend: @PreAuthorize("hasRole('ADMIN')") protects endpoints
```

---

## Key Technical Details

### JWT Token Handling
- **Storage**: `localStorage.setItem('jwtToken', token)`
- **Retrieval**: `localStorage.getItem('jwtToken')`
- **Cleanup**: `localStorage.removeItem('jwtToken')` on logout
- **Expiration**: Configured in `application.properties` (eyecarehub.app.jwtExpirationMs)

### Session Persistence
- HTTP is stateless; JWT tokens provide authentication state
- Token included in every request via Authorization header
- Server validates token and extracts user information
- User context remains throughout session until logout or token expires

### Admin Authorization
- `@PreAuthorize("hasRole('ADMIN')")` on all admin endpoints
- Frontend checks user roles before allowing admin access
- Database stores user roles, enforced server-side

---

## Database Schema Changes

### Orders Table (Enhanced)
```java
- id (String) - Order ID
- userId (String) - Reference to user
- cartItems (List) - Items in order
- totalPrice (Double)
- orderDate (LocalDateTime)
- paymentType (String) - CARD, PAYPAL, COD, etc.
- status (String) - PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
```

---

## Files Modified/Created

### Created:
- `/static/js/api.js` - API utility with JWT handling

### Modified:
- `/static/js/auth.js` - Real backend authentication
- `/static/js/cart.js` - Real order placement via API
- `/static/pages/login.html` - Added api.js reference
- `/static/pages/register.html` - Added api.js reference
- `/static/pages/checkout.html` - Added api.js reference
- `/static/admin/js/admin.js` - Complete rewrite with API calls
- `/static/admin/index.html` - Added api.js reference
- `/static/admin/users.html` - Added api.js reference
- `/static/admin/products.html` - Added api.js reference
- `/static/admin/orders.html` - Added api.js reference
- `/controller/AdminController.java` - Enhanced with full CRUD

---

## Running the Application

```bash
# Build
mvn clean install -DskipTests

# Run
java -jar target/eyecarehub-0.0.1-SNAPSHOT.jar

# Or use run_app.bat script in project root
```

Navigate to: `http://localhost:8080`

---

## Benefits

✅ **Session Persistence** - Users stay logged in across operations
✅ **Real Backend Storage** - All data persists to database
✅ **Admin Control** - Complete management dashboard for products, users, orders
✅ **Secure** - JWT tokens, password hashing, role-based access control
✅ **Scalable** - API-driven architecture supports future features
✅ **Professional** - Production-ready authentication and authorization

---

## Next Steps (Optional Enhancements)

1. Add product categories management in admin
2. Add user role management (promote user to admin)
3. Add order tracking with notifications
4. Add product reviews and ratings
5. Add payment gateway integration
6. Add inventory management alerts
7. Add email notifications for orders
8. Add analytics dashboard for sales

