const axios = require('axios');
(async () => {
  const qs = require('querystring');
  
  try {
    const res = await axios.post('https://fdownloader.net/api/ajaxSearch', qs.stringify({
      q: 'https://www.facebook.com/100067691522209/videos/895315895781359',
      vt: 'facebook'
    }), {
      headers: {
        'Accept': '*/* ',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log(res.data);
  } catch (e) {
    console.error(e.message);
  }
})();
