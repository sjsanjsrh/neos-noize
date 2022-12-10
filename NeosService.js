/**
 * NoseAPI module service class
 * @file NeosService.js
 * @author Sinduy <sjsanjsrh@naver.com>
*/

const Neos = require("@bombitmanbomb/neosjs");
const fetch = require('node-fetch');
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

    /**
     * Get sessions
     * @returns {Promise} session object
     */
    getSessions(){
        let url = "https://api.neos.com/api/sessions"
        new Promise((resolve, reject) => {
            fetch(url, { method: "Get" })
            .then(res => res.json())
            .then((json) => {
                json.forEach(e => { //NeosDB to HTTP thumbnail URL in session object
                    if(e.thumbnail !== undefined)
                        e.thumbnail = this.neos.NeosDBToHttp(e.thumbnail);
                });
                resolve(json);
            })
        });
    }
}

module.exports = NeosService;