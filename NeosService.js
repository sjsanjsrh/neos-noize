/**
 * NoseAPI module service class
 * @file NeosService.js
 * @author Sinduy <sjsanjsrh@naver.com>
*/

const Neos = require("@bombitmanbomb/neosjs");
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
        return this.getSessions();
    }
    getSessions(){
        return this.neos.Login(config.username,config.password).then(()=>{
            return this.neos.getSessions();
        });
    }
}

module.exports = NeosService;