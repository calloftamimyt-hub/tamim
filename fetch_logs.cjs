const https = require('https');

https.get('https://api.github.com/repos/calloftamimyt-hub/tamim/actions/runs', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const runs = JSON.parse(data).workflow_runs;
    if(runs && runs.length > 0) {
      const runId = runs[0].id;
      https.get(`https://api.github.com/repos/calloftamimyt-hub/tamim/actions/runs/${runId}/jobs`, {
        headers: { 'User-Agent': 'Node.js' }
      }, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          const jobs = JSON.parse(data2).jobs;
          if(jobs && jobs.length > 0) {
            console.log("Job ID:", jobs[0].id);
            https.get(`https://api.github.com/repos/calloftamimyt-hub/tamim/actions/jobs/${jobs[0].id}/logs`, {
              headers: { 'User-Agent': 'Node.js', 'Accept': 'application/vnd.github.v3+json' },
            }, (res3) => {
              if(res3.statusCode === 302) {
                https.get(res3.headers.location, {}, (res4) => {
                  let logData = '';
                  res4.on('data', c => logData += c);
                  res4.on('end', () => console.log(logData.substring(Math.max(0, logData.length - 4000))));
                });
              } else {
                console.log("Failed to get logs redirect, status:", res3.statusCode);
              }
            });
          }
        });
      });
    }
  });
}).on('error', console.error);
