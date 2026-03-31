async function test() {
    try {
        await fetch('http://localhost:8080/api/auth/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: 'superadmin992',
                email: 'superadmin992@eyecarehub.com',
                password: 'Password123!',
                roles: ['admin']
            })
        });

        const loginRes = await fetch('http://localhost:8080/api/auth/signin', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: 'superadmin992@eyecarehub.com',
                password: 'Password123!'
            })
        });
        const loginData = await loginRes.json();
        
        const ordersRes = await fetch('http://localhost:8080/api/admin/orders', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        const ordersData = await ordersRes.json();
        console.log('ORDER COUNT: ' + ordersData.length);
        if (ordersData.length > 0) {
            console.log('LATEST ORDER USER:', ordersData[ordersData.length-1].user?.email || 'N/A');
            console.log('LATEST ORDER ITEMS:', ordersData[ordersData.length-1].items?.length || 0);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
