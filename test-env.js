const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
console.log('PAYPAL_CLIENT_ID:', process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? 'Exists' : 'Missing');
console.log('PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? 'Exists' : 'Missing');
