const ytdl = require('@distube/ytdl-core');
ytdl.getInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ').then(info => {
  const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
  console.log(formats.map(f => f.url).join('\\n---\\n'));
}).catch(console.error);
