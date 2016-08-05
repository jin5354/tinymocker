'use strict';
const cluster = require('cluster');
const jsonfile = require('jsonfile');
const mockDataFile = './mockData.json';

let expressPort = 9998;
let proxyPort = 9999;

if(cluster.isMaster) {

    let proxy = cluster.fork();

    cluster.on('exit', (worker, code, signal) => {
        if(signal == 'SIGKILL') {
            console.log(`EXITED. SIGNAL: ${signal}`);
        }else{
            console.log(`EXITED. SIGNAL: ${signal}; CODE: ${code}`);
            proxy = cluster.fork();
        }
    });

    const express = require('express');
    const app = express();
    const logger = require('morgan');
    const bodyParser = require('body-parser');

    app.use(express.static(__dirname + '/views/dist'));
    app.use(logger('dev'));
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/pages/index.html');
    });

    app.get('/mockData', (req, res) => {
        res.json(jsonfile.readFileSync(mockDataFile));
    });

    app.post('/addMockData', (req, res) => {
        let tempNewMock = req.body;
        delete tempNewMock.headersStr;
        let tempMockData = jsonfile.readFileSync(mockDataFile);
        tempMockData.unshift(tempNewMock);
        jsonfile.writeFileSync(mockDataFile, tempMockData, {spaces: 4});
        try {
            res.json({
                result: 1,
                mockData: tempMockData
            });
            setTimeout(() => {
                proxy.process.kill('SIGKILL');
                proxy = cluster.fork();
            },300);
        }catch(e) {
            res.json({
                result: 0,
                error: e
            });
        }
    });

    app.post('/editMockData', (req, res) => {
        let tempNewMock = req.body;
        delete tempNewMock.headersStr;
        let tempMockData = jsonfile.readFileSync(mockDataFile);
        let target = tempMockData.findIndex((e) => {
            return e.urlReg == tempNewMock.urlReg;
        });
        if(target != -1) {
            tempMockData.splice(target, 1, tempNewMock);
            jsonfile.writeFileSync(mockDataFile, tempMockData, {spaces: 4});

            res.json({
                result: 1,
                mockData: tempMockData
            });
            setTimeout(() => {
                proxy.process.kill('SIGKILL');
                proxy = cluster.fork();
            },300);
        }else {
            res.json({
                result: 0,
                error: '无匹配项'
            });
        }
    });

    app.post('/delMockData', (req, res) => {
        let tempUrlReg = req.body.urlReg;
        let tempMockData = jsonfile.readFileSync(mockDataFile);
        let target = tempMockData.findIndex((e) => {
            return e.urlReg == tempUrlReg;
        });
        if(target != -1) {
            tempMockData.splice(target, 1);
            jsonfile.writeFileSync(mockDataFile, tempMockData, {spaces: 4});

            res.json({
                result: 1,
                mockData: tempMockData
            });
            setTimeout(() => {
                proxy.process.kill('SIGKILL');
                proxy = cluster.fork();
            },300);
        }else {
            res.json({
                result: 0,
                error: '无匹配项'
            });
        }
    });

    app.post('/enableMockData', (req, res) => {
        let tempUrlReg = req.body.urlReg;
        let tempMockData = jsonfile.readFileSync(mockDataFile);
        let target = tempMockData.findIndex((e) => {
            return e.urlReg == tempUrlReg;
        });
        if(target != -1) {
            tempMockData[target].enabled = true;
            jsonfile.writeFileSync(mockDataFile, tempMockData, {spaces: 4});

            res.json({
                result: 1,
                mockData: tempMockData
            });
            setTimeout(() => {
                proxy.process.kill('SIGKILL');
                proxy = cluster.fork();
            },300);
        }else {
            res.json({
                result: 0,
                error: '无匹配项'
            });
        }
    });

    app.post('/disableMockData', (req, res) => {
        let tempUrlReg = req.body.urlReg;
        let tempMockData = jsonfile.readFileSync(mockDataFile);
        let target = tempMockData.findIndex((e) => {
            return e.urlReg == tempUrlReg;
        });
        if(target != -1) {
            tempMockData[target].enabled = false;
            jsonfile.writeFileSync(mockDataFile, tempMockData, {spaces: 4});

            res.json({
                result: 1,
                mockData: tempMockData
            });
            setTimeout(() => {
                proxy.process.kill('SIGKILL');
                proxy = cluster.fork();
            },300);
        }else {
            res.json({
                result: 0,
                error: '无匹配项'
            });
        }
    });

    app.listen(expressPort, () => {
        console.log('Express started and running on port 9998.');
    });

}else {

    const tinyProxy = require('tinyproxy');
    const request = require('request');
    const url = require('url');
    let mockData = jsonfile.readFileSync(mockDataFile);

    let mock = (req, res, requestOptions) => {
        let result = {};
        let flag = mockData.some((e)=>{
            let urlReg = new RegExp(e.urlReg, 'i');
            if(e.enabled && urlReg.test(req.url)) {
                result.headers = e.headers;
                result.statusCode = e.statusCode;
                if(e.jsonp) {
                    let parsedUrl,callbackStr;
                    try {
                        parsedUrl = url.parse(req.url, true);
                        callbackStr = parsedUrl.query.callback;
                        result.body = `${callbackStr}(${e.body})`;
                    }catch(error) {
                        console.log('jsonpReg Error: ' + error);
                        result.body = e.body;
                    }
                }else {
                    result.body = e.body;
                }
            }
            return e.enabled && urlReg.test(req.url);
        });
        if(flag) {
            console.log(`MOCK ${req.method}: ${req.url}`);
            res.writeHead(result.statusCode, '', result.headers);
            res.end(result.body);
        }else {
            request(requestOptions, (error, response, body) => {
                try {
                    res.writeHead(response.statusCode, '', response.headers);
                    res.end(body);
                }catch(e) {
                    console.log(e);
                }
            });
        }
    };

    let proxy = new tinyProxy({
        port: proxyPort,
        agent: 'http',
        mock: mock
    });
    proxy.start();
    console.log('Proxy started! Listening on port 9999.');
}