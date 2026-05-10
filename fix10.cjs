const fbdl = require('fb-downloader-scrapper');
fbdl.getFbVideoInfo("https://www.facebook.com/100067691522209/videos/895315895781359").then(res => console.log(JSON.stringify(res))).catch(e => console.error(e));
