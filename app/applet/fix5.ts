import https from 'https';

const data = JSON.stringify({
  url: "https://www.facebook.com/100067691522209/videos/895315895781359"
});

const req = https.request('https://api.cobalt.tools/api/json', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0'
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('RESPONSE:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
