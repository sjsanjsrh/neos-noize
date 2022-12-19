/**
 * implements the visible session icon
 * @file sessionIcon.js
 * @author Sinduy <sjsanjsrh@naver.com>
 * @version 1.1.1
 * @requires panorama.js
 * @requires neos_common.js
 */

/** @type {number} PanoramaPreview camera rotate speed */
const rotateSpeed = 0.01;

/**
 * session icon class indicates the session information
 * @class SessionIcon
 * @property {obj} data session data
 * @property {HTMLElement} domElement session icon dom element
 * @property {PanoramaPreview} panorama session icon panorama
 * @property {HTMLElement} alt session icon alt dom element
 * @param {obj} data session data
 * @param {HTMLElement} domElement session icon container
 */
class SessionIcon{
    _panorama = null;
    _altEnabled = true;
    get panorama(){
        return this._panorama;
    }

    constructor(domElement, data, alt){
        this.data = data;
        this._speed = rotateSpeed;

        const sessionIcon = addElement(domElement,"sessionIcon");
        this.domElement = sessionIcon;
        sessionIcon.classList.add("AL_"+data.accessLevel);
        if(data.headlessHost) sessionIcon.classList.add("headless");

        this._thumbnail = addElement(sessionIcon,"thumbnail");
        this._alt = alt.cloneNode(true);
        if(this._thumbnail instanceof HTMLElement) this._thumbnail.appendChild(this._alt);

        this.dataElements = {};
        addDataElement(this.dataElements, sessionIcon,"name");
        addDataElement(this.dataElements, sessionIcon,"hostUsername");
        addDataElement(this.dataElements, sessionIcon,"activeUsers");

        addDataElement(this.dataElements, sessionIcon,"joinedUsers");
        addDataElement(this.dataElements, sessionIcon,"maxUsers");
        addUserDataElements(this.dataElements, sessionIcon,"sessionUsers");
        addDataArrayElements(this.dataElements, sessionIcon,"tags");
        addDataElement(this.dataElements, sessionIcon,"neosVersion");
        addSessionURLElements(this.dataElements, sessionIcon,"sessionId");

        function addSessionURLElements(elements, parent, name){
            const element = addElement(parent,name);
            if(data[name]){
                const e = document.createElement("a");
                e.innerText = data.sessionId;
                e.href = "neos:?world=neos-session:///"+data.sessionId;

                element.appendChild(e);
            }
            elements[name] = element;
            return element;
        }


        function addDataArrayElements(elements, parent, name){
            const element = addElement(parent,name);
            if(data[name]){
                data[name].forEach((d)=>{
                    const e = document.createElement("div");
                    e.innerText = d;
                    element.appendChild(e);
                });
            };
            elements[name] = element;
            return element;
        }

        function addUserDataElements(elements, parent, name){
            const element = addElement(parent,name);
            if(data[name]){
                data[name].forEach((user)=>{
                    const e = document.createElement("div");
                    e.innerText = user.username;
                    if(user.userID === data.hostUserId) e.classList.add("owner");
                    if(user.isPresent) e.classList.add("present");
                    if(user.outputDevice) e.classList.add(`outputDevice_${user.outputDevice}`);
                    e.classList.add(`${user.userID}`);
                    element.appendChild(e);
                });
            };
            elements[name] = element;
            return element;
        }


        function addDataElement(elements, parent, name){
            const element = addElement(parent,name);
            elements[name] = element;
            element.innerHTML = neos_text_to_html(data[name],"div");
            return element;
        }

        function addElement(parent, name){
            const element = document.createElement("div");
            element.classList.add(name);
            parent.appendChild(element);
            return element;
        }
    }

    /**
     * update session icon data and dom element
     * @param {obj} data data to update
     * @returns 
     * @memberof SessionIcon
     */
    update(data){
        if(!data) return;

        if(this.data.accessLevel != data.accessLevel){
            this.domElement.classList.remove("AL_"+this.data.accessLevel);
            this.domElement.classList.add("AL_"+this.data.accessLevel);
        }
        if(this.data.headlessHost != data.headlessHost){
            this.domElement.classList.remove("headless");
            if(this.data.headlessHost) this.domElement.classList.add("headless");
        }

        if(this.data.thumbnail != data.thumbnail){
            if(this._panorama)
                this._panorama.loadImage(this.data.thumbnail);
        }
        if(JSON.stringify(this.data.sessionUsers) !== JSON.stringify(data.sessionUsers)){
            let newusers = data.sessionUsers;
            this.data.sessionUsers.forEach((user)=>{
                const newuser = data.sessionUsers.find((u)=>u.userID === user.userID)
                const e = this.dataElements.sessionUsers.querySelector(`.${user.userID}`);
                newusers = newusers.filter((u)=>u.userID !== user.userID);
                if(e){
                    if(!newuser){ // user left
                        e.remove();
                    }else{ // user updated
                            if(user.username !== newuser.username) e.innerText = newuser.username;
                            if(user.isPresent !== newuser.isPresent){
                                if(newuser.isPresent) e.classList.add("present");
                                else e.classList.remove("present");
                            }
                            if(user.outputDevice !== newuser.outputDevice){
                                if(user.outputDevice) e.classList.remove(`outputDevice_${user.outputDevice}`);
                                if(newuser.outputDevice) e.classList.add(`outputDevice_${newuser.outputDevice}`);
                            }
                    }
                }
            });
            newusers.forEach((newuser)=>{ // new user joined
                const e = document.createElement("div");
                e.innerText = newuser.username;
                if(newuser.userID === data.hostUserId) e.classList.add("owner");
                if(newuser.isPresent) e.classList.add("present");
                if(newuser.outputDevice) e.classList.add(`outputDevice_${newuser.outputDevice}`);
                e.classList.add(`${newuser.userID}`);
                this.dataElements.sessionUsers.appendChild(e);
            });
        }

        if(JSON.stringify(this.data.tags) !== JSON.stringify(data.tags)){
            this.dataElements.tags.innerHTML = "";
            data.tags.forEach((tag)=>{
                const e = document.createElement("div");
                e.innerText = tag;
                this.dataElements.tags.appendChild(e);
            });
        }

        let gnore = ["thumbnail","sessionUsers","tags","sessionURLs"];
        Object.keys(data).forEach((key)=>{
            if(gnore.includes(key)) return;
            if(this.data[key] != data[key]){
                if(this.dataElements[key]){
                    this.dataElements[key].innerHTML = neos_text_to_html(data[key]);
                }
            }
        });

        this.data = data;
    }
    /**
     * remove session icon dom element
     * @memberof SessionIcon
     */
    remove(){
        this.domElement.remove();
    }

    /**
     * load panorama image
     * @returns {Promise} promise object
     * @promise {PanoramaPreview} panorama object if success
     * @promise {null} null if thumbnail is not exist
     * @fail {string} error message
     * @memberof SessionIcon
     */
    panorama_load(){
        return new Promise((resolve, reject) => {
            if(!this._altEnabled)
                return resolve(this._panorama);
            if(this.data.thumbnail){
                this._panorama = this._createPanoramaViewer(this._thumbnail, this.data.thumbnail).then((panorama)=>{
                    this._panorama = panorama;
                    this._thumbnail.appendChild(this._panorama.domElement);
                    this._altEnabled = false;
                    resolve(this._panorama);
                }).catch((err)=>{
                    reject(err);
                });
            }else{
                this.panorama_unload();
                resolve(null);
            }
        });
    }

    panorama_unload(){
        this._panorama = null;
        this._thumbnail.innerHTML = "";
        this._thumbnail.appendChild(this._alt);
        this._altEnabled = true;
    }

    _createPanoramaViewer(div, img){
        return new Promise((resolve, reject) => {
            if(!webgl_support())
                reject("WebGL is not supported");

            const pano = new PanoramaPreview(div);
            pano.loadImage(img).then(()=>{
                let px = 0;
                let tx = 0;
                let ty = 0;
                let speed = 1;

                div.onmousemove = function(event){
                    const x = event.offsetX/div.clientWidth-0.5;
                    const y = event.offsetY/div.clientHeight-0.5;
                    tx = -x*1.95;
                    ty = -y*1.95;
                    speed = 1;
                    pano.enable();
                }
                div.onmouseout = function(event){
                    tx = ty = speed = 0;
                }
                pano.beforeRender = (dt) => {
                    const alpha = 0.05;
                    pano.pitch = pano.pitch*(1-alpha) + ty*alpha;
                    pano.yaw -= px;
                    px = px*(1-alpha) + tx*alpha;
                    pano.yaw += speed*dt+px;

                    const err = Math.abs(px-tx)+Math.abs(pano.pitch-ty);
                    if(err < 0.0001 && speed < 0.0001){
                        pano.disable();
                    }
                }
                resolve(pano);
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}

function webgl_support() { 
    try {
     var canvas = document.createElement('canvas'); 
     return !!window.WebGLRenderingContext &&
       (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch(e) {
      return false;
    }
  };