import https from 'https';

const url = "https://www.facebook.com/100067691522209/videos/895315895781359";
const payload = JSON.stringify({ url });

const req = https.request({
  hostname: 'api.cobalt.tools',
  path: '/api/json',
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});

req.on('error', console.error);
req.write(payload);
req.end();
