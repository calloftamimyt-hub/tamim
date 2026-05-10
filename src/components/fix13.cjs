const axios = require('axios');
axios.get("https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent("https://facebook.com/100067691522209/videos/895315895781359")).then(res => {
  const html = res.data;
  console.log("HD MATCH 2:", !!html.match(/playable_url_quality_hd/));
  console.log("SD MATCH:", !!html.match(/playable_url/));
}).catch(e => console.error(e.message));
