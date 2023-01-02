/**
 * load config.json file
 * @file ConfigLoader.js
 * @author Sinduy <sjsanjsrh@naver.com>
 */

const path = require('path');
const configPath = path.join(__dirname, 'config.json');
const fs = require('fs');

const defaultConfig = {
    express: false,
    express_port: 8080,
    thumbnail_dir: "html/thumbnails/",
    thumbnail_url: "thumbnails/",
    sessions_file: "html/sessions.json",
    update_interval: 6000
};


function loadConfig(path) {
    if(!fs.existsSync(path)) {
        return {};
    }
    else {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    }
}

const config = loadConfig(configPath);

for (let key in defaultConfig) {
    if (!config.hasOwnProperty(key)) {
        config[key] = defaultConfig[key];
    }
}

for(let key in config) {
    if(!defaultConfig.hasOwnProperty(key)) {
        delete config[key];
    }
}

const str = JSON.stringify(config, null, 4);

fs.WriteStream(configPath).write(str);

/**
 * load config.json file
 * @module ConfigLoader
 * @type {Object}
 */
module.exports = config;