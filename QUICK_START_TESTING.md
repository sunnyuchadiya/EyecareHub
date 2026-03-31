# Quick Start Testing Guide

## Step-by-Step Testing

### **Step 1: Start the Application**
```bash
cd c:\Users\sunny\OneDrive\Desktop\sem2project spring boot\sem2project
mvn spring-boot:run
```
Or use the `run_app.bat` script.

Application will be available at: `http://localhost:8080`

---

### **Step 2: Register a New User**
1. Go to `http://localhost:8080/pages/register.html`
2. Fill in the registration form:
   - Name: `Test User`
   - Email: `testuser@email.com`
   - Mobile: `9876543210`
   - Password: `TestPass123`
   - Confirm Password: `TestPass123`
3. Click "Create Account"
4. You'll be redirected to login page

---

### **Step 3: Login**
1. Go to `http://localhost:8080/pages/login.html`
2. Enter credentials:
   - Email: `testuser@email.com`
   - Password: `TestPass123`
3. Click "Sign In"
4. You'll be logged in and redirected to home page
5. Notice the JWT token is stored in browser's localStorage

**Check localStorage:**
- Open Developer Console (F12)
- Go to "Application" → "Local Storage"
- You'll see `jwtToken` saved

---

### **Step 4: Place an Order (Session Persistence Test)**
1. On home page, add some products to cart
2. Go to Cart
3. Click "Proceed to Checkout"
4. Fill in shipping details
5. Select payment method
6. Click "Complete Order"
7. **Order is placed and saved to database**
8. You'll see order confirmation with Order ID

**Important**: After placing order, you **don't need to login again**!
The session persists because JWT token is being used.

---

### **Step 5: Access Admin Dashboard**
**Note**: You need to have admin role. For testing:

**Option A: Create Admin in Database**
Use MongoDB Compass:
1. Connect to your MongoDB instance
2. Open `eyecarehub` database
3. Go to `users` collection
4. Find your test user
5. Edit and add to roles array: `"ROLE_ADMIN"`

**Option B: Use Pre-created Admin Account (if exists)**
- Look in your DATABASE_SETUP.md for admin credentials

---

### **Step 6: Admin Dashboard Operations**

#### **Dashboard** (`http://localhost:8080/admin/index.html`)
- View total users, products, and orders
- See live stats animated

#### **Users** (`http://localhost:8080/admin/users.html`)
- See list of all registered users
- Delete users from system

#### **Products** (`http://localhost:8080/admin/products.html`)
- View all products with images, names, categories, prices, stock
- **Add Product**: Click "+ Add Product" button
  - Fill name, category, price, stock, image URL
  - Click "Save Product"
- **Edit Product**: Click edit icon on any product
  - Modify details
  - Click "Save Product"
- **Delete Product**: Click delete icon
  - Confirm deletion

#### **Orders** (`http://localhost:8080/admin/orders.html`)
- View all orders placed
- See order ID, date, total, status
- **Update Status**: Select new status from dropdown
  - Options: Pending, Processing, Shipped, Delivered, Cancelled
  - Changes save immediately
- **Delete Order**: Click delete icon to remove order

---

## Testing Checklist

- [ ] User can register successfully
- [ ] User can login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] JWT token appears in localStorage after login
- [ ] User can add products to cart
- [ ] User can proceed to checkout without re-login
- [ ] Order is successfully placed
- [ ] User remains logged in after placing order (no redirect to login)
- [ ] Admin can access admin dashboard (`/admin/index.html`)
- [ ] Admin can view users list
- [ ] Admin can view products list
- [ ] Admin can add a new product
- [ ] Admin can edit a product
- [ ] Admin can delete a product
- [ ] Admin can view orders list
- [ ] Admin can update order status
- [ ] Admin can delete orders
- [ ] Dashboard shows correct stats (users, products, orders count)

---

## Common Issues & Solutions

### **Issue: "Access denied. Admin role required."**
**Solution**: Make sure your user has `ROLE_ADMIN` in MongoDB roles array

### **Issue: "Cannot find property jwtToken"**
**Solution**: Make sure `api.js` is loaded before other scripts

### **Issue: 401 Unauthorized on API calls**
**Solution**: Clear localStorage and login again

### **Issue: Products/Users/Orders not showing**
**Solution**: 
1. Check browser console for errors (F12)
2. Ensure backend is running
3. Check network tab to see API response

### **Issue: Can't logout**
**Solution**: 
- Logout function removes token from localStorage
- If "stuck" logged in, use browser DevTools to clear localStorage

---

## Debugging Tips

### **View API Requests**
1. Open Developer Console (F12)
2. Go to "Network" tab
3. Make any action (login, place order, etc.)
4. See all HTTP requests with responses

### **Check JWT Token**
1. Go to `https://jwt.io`
2. Paste token from localStorage
3. Verify payload contains user info

### **Check Browser Console**
1. F12 → Console tab
2. Look for any JavaScript errors
3. See console.log outputs

### **Check Server Logs**
Application logs show all backend operations:
```
POST /api/auth/signin - User logged in
POST /api/orders - Order placed
GET /api/admin/products - Admin fetched products
```

---

## Expected Results

### **Session Management Test**
```
✓ Login → Token saved in localStorage
✓ Add to Cart → Token sent with requests
✓ Place Order → Backend creates order record
✓ Order Confirmed → User stays logged in (no redirect)
✓ Navigate site → Session persists
```

### **Admin CRUD Test**
```
✓ View Users → Shows all registered users
✓ Add Product → New product appears in database
✓ Edit Product → Changes reflected immediately
✓ Delete Product → Product removed from database
✓ Update Order → Status changes in real-time
```

---

## Next Verification

After testing, verify in database:

```bash
# Check user in MongoDB
db.users.findOne({email: "testuser@email.com"})

# Check orders created
db.orders.find({})

# Check products created
db.products.find({})
```

---

## Success Indicators

✅ Session persists across operations
✅ No unexpected re-login required
✅ Admin can create, read, update, delete items
✅ All data saves to database permanently
✅ Token automatically sent with requests
✅ Proper error messages on failures

---

## Support

If you encounter issues:
1. Check the SESSION_FIX_DOCUMENTATION.md for detailed info
2. Review console errors (F12)
3. Check backend logs for error details
4. Verify MongoDB connection
5. Ensure admin role is set in user document

