const express = require('express');
const bodyParser = require('body-parser');
const {codegen} = require('./codegen')
const atob = require('atob');
const btoa = require('btoa');

let app = express();

app.use('/static', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/', function (req, res) {
    res.render('index');
});

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

app.post('/data', function (req, res) {
    if (!req.body) {
        return res.sendStatus(404);
    }
    let codeData = req.body.data;
    let error = false;
    codegen(b64DecodeUnicode(codeData), (data) => {
        if (error) return;
        let resp = {
            status: "success",
            data: b64EncodeUnicode(data),
        };
        res.send(JSON.stringify(resp));
        res.end();
    }, (data) => {
        if (data.length === 0) return; 
        error = true;
        let resp = {
            status: "error",
            data: b64EncodeUnicode(data),
        }
        res.send(JSON.stringify(resp));
        res.end();
    })
});

app.listen(3000, function () {
    console.log('listening 3000...')
})

app.set('view engine', 'jade');
