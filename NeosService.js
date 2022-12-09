
/**
 * NoseAPI module service class
 * @file NeosService.js
 * @author Sinduy <sjsanjsrh@naver.com>
*/
const Neos = require("@bombitmanbomb/neosjs");
export class NeosService{
    constructor(){
        this.neos = new Neos();
    }
}