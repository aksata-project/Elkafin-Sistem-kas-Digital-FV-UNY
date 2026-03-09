const http = require('http');
http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url.startsWith('/err')) {
        console.log('--- ERROR DARI BROWSER USER ---');
        console.log(decodeURIComponent(req.url));
        console.log('-------------------------------');
    }
    res.end('ok');
}).listen(5000, () => console.log('Listening for errors on 5000'));
