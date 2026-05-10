const axios = require('axios');
axios.get("https://social-download-api.vercel.app/api/fb?url=https://www.facebook.com/100067691522209/videos/895315895781359").then(res => console.log(res.data)).catch(e => console.error(e.message));
