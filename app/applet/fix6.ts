import https from 'https';

https.get('https://bk9.fun/download/fb?url=https://www.facebook.com/100067691522209/videos/895315895781359', res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('RESPONSE:', body));
});
