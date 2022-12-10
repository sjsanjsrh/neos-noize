/**
 * NoseAPI module service class
 * @file NeosService.js
 * @author Sinduy <sjsanjsrh@naver.com>
*/

/**
 * NeosAPI wrapper
 */
class NeosService{
    static Neos = require("@bombitmanbomb/neosjs");
    
    constructor(){
        this.neos = new Neos();
    }
}

module.exports = NeosService;