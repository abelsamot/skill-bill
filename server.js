const express = require('express')
var request = require("request")
const app = express()
const port = 5000
const mongoose = require('mongoose');
const { assert } = require('chai');
const { ObjectId } = require('bson');
const bodyParser = require('body-parser');
const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const PythonShell = require("python-shell").PythonShell;
const { resolve } = require('path/posix');
var _ = require('underscore');
require("dotenv").config()

app.get('/similarweb', (req, res) => {
    request("https://api.similarweb.com/v1/website/worldia.com/general-data/all?api_key=1804ef1224df413eab4304ce775df843",
    function(error,response,body){
        if(!error && response.statusCode==200){
            var parsedBody = JSON.parse(body)
            var siteName= parsedBody.site_name
            res.send({siteName})
        }
    })
  })
app.get('/', (req, res) => {
    res.send("Hello")
  })
