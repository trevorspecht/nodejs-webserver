'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');

let storedRequests = [];

const listener = function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  let q = url.parse(req.url, true);
  let pathName = q.pathname;
  let queryData = q.query;

  if (pathName === '/set') {
    storedRequests.push(queryData);
    const data = new Uint8Array(Buffer.from(JSON.stringify(queryData) + '\n'));
    fs.appendFileSync('./requests.txt', data);
    res.write(`stored key/value: ${JSON.stringify(queryData)}`);
  }

  if (pathName === '/get') {
    const queryKey = Object.keys(queryData)[0];
    const file = fs.readFileSync('./requests.txt', {encoding: 'utf8'});
    let requests = file.split('\n');
    for(let i = 0; i < (requests.length - 1); i++) {
        let request = JSON.parse(requests[i]);
        let fileKey = Object.keys(request)[0];
        if (fileKey === queryKey) {
            res.write(`value '${Object.values(request)}' found for key '${queryKey}'`);
            break;
        } else if (i === requests.length - 2) res.write(`key not found: ${queryKey}`)
    }

    /**
     * This section reads and writes from ephemeral memory
     * with no txt file or other permanent storage
     * 
     * var key = Object.keys(queryData)[0];
     * var found = storedRequests.find(e => Object.keys(e)[0] === key);
     * if (found) {
     *   res.write(`value '${Object.values(found)}' found for key '${key}'`);
     * } else res.write(`key not found: ${key}`);
     */
    
  }

  res.end();
}

const server = http.createServer(listener);
server.listen(4000);
