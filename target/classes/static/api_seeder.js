const data = [
    { name: "Ray-Ban Aviator Classic", category: "Sunglasses", brand: "Ray-Ban", price: 13499, imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1760&auto=format&fit=crop", description: "Timeless aviator style with G-15 lenses.", rating: 4.8 },
    { name: "Oakley Holbrook", category: "Sunglasses", brand: "Oakley", price: 12999, imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1760&auto=format&fit=crop", description: "Iconic American frame design.", rating: 4.7 },
    { name: "Blue Cut Computer Glasses", category: "Computer Glasses", brand: "Lenskart Air", price: 3749, imageUrl: "https://i.pinimg.com/1200x/33/18/d9/3318d994a332e9a3253709ac9d8d897b.jpg", description: "Zero power blue light blocking lenses.", rating: 4.6 },
    { name: "Tom Ford FT5634", category: "Eyeglasses", brand: "Tom Ford", price: 31499, imageUrl: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=1742&auto=format&fit=crop", description: "Luxury square acetate frames.", rating: 4.9 },
    { name: "Acuvue Oasys (6 Pack)", category: "Contact Lenses", brand: "Johnson & Johnson", price: 2999, imageUrl: "https://i.pinimg.com/736x/93/8b/0f/938b0f6716da3fc22111d22855f72db5.jpg", description: "Hydraclear Plus technology for comfort.", rating: 4.8 },
    { name: "Wayfarer Matte Black", category: "Eyeglasses", brand: "Vincent Chase", price: 4999, imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=1740&auto=format&fit=crop", description: "Classic matte finish for daily wear.", rating: 4.5 },
    { name: "Round Metal Gold", category: "Eyeglasses", brand: "John Jacobs", price: 6999, imageUrl: "https://images.unsplash.com/photo-1508296695146-25e7b52a8f99?q=80&w=1740&auto=format&fit=crop", description: "Vintage inspired round metal frames.", rating: 4.7 },
    { name: "Anti-Glare Driving Glasses", category: "Sunglasses", brand: "Polarix", price: 4549, imageUrl: "https://i.pinimg.com/736x/5c/ca/e1/5ccae1b180f718b5327c281bb580ad63.jpg", description: "Polarized lenses for night driving.", rating: 4.4 },
    { name: "Daily Disposables (30 Pack)", category: "Contact Lenses", brand: "Bausch + Lomb", price: 3749, imageUrl: "https://i.pinimg.com/1200x/6f/5d/fb/6f5dfbd218ff39c61b0a95d08361f95f.jpg", description: "Fresh pair for every new day.", rating: 4.6 },
    { name: "Transparent Acetate Frames", category: "Computer Glasses", brand: "Lenskart Air", price: 4149, imageUrl: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?q=80&w=1740&auto=format&fit=crop", description: "Crystal clear frames with blue cut.", rating: 4.7 }
];

async function seed() {
    try {
        console.log("Authenticating as superadmin992@eyecarehub.com...");
        const loginRes = await fetch('http://localhost:8080/api/auth/signin', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: 'superadmin992@eyecarehub.com', password: 'Password123!' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error("Auth Failed! Server response: " + JSON.stringify(loginData));
        
        console.log("Token received length: " + token.length);
        console.log("Seeding Database...");
        
        for (let item of data) {
            item.stock = 15;
            item.gender = 'Unisex';
            item.discount = 0;
            
            const res = await fetch('http://localhost:8080/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(item)
            });
            if (!res.ok) {
                const err = await res.text();
                console.error("Failed to insert: " + item.name + " -> " + err);
            } else {
                console.log("Inserted: " + item.name);
            }
        }
        console.log("DONE SEEDING.");
    } catch(e) {
        console.error(e);
    }
}
seed();
