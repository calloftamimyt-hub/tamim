const axios = require('axios');
axios.get("https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent("https://facebook.com/100067691522209/videos/895315895781359")).then(res => {
  const html = res.data;
  console.log(html.length);
  const m = html.match(/browser_native_hd_url/);
  console.log("HD MATCH:", !!m);
}).catch(e => console.error(e.message));
