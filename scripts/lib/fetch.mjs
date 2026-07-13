// Minimal HTTPS GET helper (Node 16 has no global fetch). Follows one redirect.
import https from 'node:https';

export function get(url, redirectsLeft = 3) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            // Serebii serves different markup to unknown agents; mimic a browser.
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
            Accept: 'text/html',
          },
        },
        (res) => {
          const { statusCode, headers } = res;
          if (statusCode >= 300 && statusCode < 400 && headers.location && redirectsLeft > 0) {
            res.resume();
            const next = new URL(headers.location, url).toString();
            resolve(get(next, redirectsLeft - 1));
            return;
          }
          if (statusCode !== 200) {
            res.resume();
            reject(new Error(`GET ${url} -> ${statusCode}`));
            return;
          }
          // Serebii is served as ISO-8859-1 (latin1); decode accordingly.
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks).toString('latin1')));
        }
      )
      .on('error', reject);
  });
}
