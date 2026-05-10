const axios = require('axios');
(async () => {
  const FormData = require('form-data');
  const fd = new FormData();
  fd.append('q', 'https://www.facebook.com/100067691522209/videos/895315895781359');
  fd.append('vt', 'facebook');
  
  try {
    const res = await axios.post('https://snapsave.app/action.php', fd, { headers: fd.getHeaders() });
    console.log(res.data);
  } catch (e) {
    console.error(e.message);
  }
})();
