/**
 * NoseAPI module service class
 * @file NeosService.js
 * @author Sinduy <sjsanjsrh@naver.com>
*/

const Neos = require("@bombitmanbomb/neosjs");
const fetch = require('node-fetch')
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

/**
 * NeosAPI wrapper
 */
class NeosService{
    
    constructor(){
        this.neos = new Neos();
    }

    /**
     * Run NeosService
    */
    run(){
        this.getSessions();
    }
    getSessions(){
        let url = "https://api.neos.com/api/sessions"
        fetch(url, { method: "Get" })
        .then(res => res.json())
        .then((json) => {
            console.log(json[0].thumbnail);
        })
    }
}

module.exports = NeosService;