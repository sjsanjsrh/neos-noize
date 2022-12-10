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
        setInterval(()=>{
            this.getSessions().then((sessions)=>{
                this.updateSessionsThumbnail(sessions);
                this.removeUnusedThumbnail(sessions);
                this.createSessionsFile(sessions);
            });
        }, config.update_interval);
    }

    /** 
     * Create sessions.json file
     * @param {Array} sessions session object
     */
    createSessionsFile(sessions){
        const filePath = __dirname+"/"+config.sessions_file;
        let data = sessions.slice()
        data = data.map(e => {
            if(NeosService.chackLink(e.thumbnail))
                e.thumbnail = NeosService.neosDBToLocalURL(e.thumbnail);
            return e;
        });
        fs.WriteStream(filePath).write(JSON.stringify(data));
    }

    /**
     * NeosDB URL to Local URL
     * @param {String} url NeosDB URL
     * @returns {String} Local URL
    */
    static neosDBToLocalURL(url){
        const filename = url.split("/").pop();
        return config.thumbnail_url+filename;
    }

    /**
     * Remove unused thumbnail images
     * @param {Array} sessions session object
     */
    removeUnusedThumbnail(sessions){
        const dir = __dirname+"/"+config.thumbnail_dir;
        const filenames = fs.readdirSync(dir);
        filenames.forEach(file => {
            if(!sessions.some(e => {
                if(NeosService.chackLink(e.thumbnail)){
                    const filename = e.thumbnail.split("/").pop();
                    return filename === file;
                }
            })){
                fs.unlinkSync(dir+file);
            }
        });
    }

    /**
     * Update sessions thumbnail image to local directory
     * @param {Array} sessions session object
     */
    updateSessionsThumbnail(sessions){
        const dir = __dirname+"/"+config.thumbnail_dir;
        sessions.forEach(e => {
            if(NeosService.chackLink(e.thumbnail)){
                const url = e.thumbnail;
                const filename = url.split("/").pop();
                if(!fs.existsSync(dir+filename))
                    fetch(url)
                    .then(res => res.buffer())
                    .then(buffer => {
                        if(!fs.existsSync(dir))
                            fs.mkdirSync(dir);
                        fs.writeFileSync(dir+filename, buffer);
                    });
            }
        });
    }

    /**
     * Get sessions
     * @returns {Promise} session object
     */
    getSessions(){
        let url = "https://api.neos.com/api/sessions"
        return new Promise((resolve, reject) => {
            fetch(url, { method: "Get" })
            .then(res => res.json())
            .then((json) => {
                json.forEach(e => { //NeosDB to HTTP thumbnail URL in session object
                    if(NeosService.chackLink(e.thumbnail)){
                        e.priv_thumbnail = e.thumbnail;
                        if(e.thumbnail.startsWith("neosdb:///"))
                            e.thumbnail = this.neos.NeosDBToHttp(e.thumbnail);
                    }
                        
                });
                resolve(json);
            })
        });
    }

    /**
     * chack avaliable link
     * @param {String} link link
     */
    static chackLink(link){
        return (link !== undefined && link !== null && link !== "" && link !== config.thumbnail_url)
    }
}

module.exports = NeosService;