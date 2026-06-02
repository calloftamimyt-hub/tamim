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
             const job = jobs[0];
             console.log("Job Name:", job.name, "Status:", job.status, "Conclusion:", job.conclusion);
             const steps = job.steps;
             steps.forEach(step => {
                console.log(`- Step: ${step.name} | Status: ${step.status} | Conclusion: ${step.conclusion}`);
             });
          }
        });
      });
    }
  });
}).on('error', console.error);
