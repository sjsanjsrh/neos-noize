/**
 * App entry point
 * @file NeosNoize.js
 * @author Sinduy <sjsanjsrh@naver.com>
*/

const fs = require('fs');
const config = require('./ConfigLoad.js');
const NeosService = require("./NeosService.js");

if(config.express){
    const express = require("express");
    const app = express();
    const path = require("path");
    const _root = __dirname+"/html"

    app.use(express.static(path.join(_root, "/"))); 
    app.use("/", (req, res)=>{
        res.sendFile(path.join(_root, "index.html"));
    })
    const server = app.listen(config.express_port, ()=>{
        console.log("Server is Listening at "+config.express_port);
    })
}


neosService = new NeosService();

neosService.run();
