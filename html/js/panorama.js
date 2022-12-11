/**
 * simple panorama viewer
 * @file panorama.js
 * @author Sinduy <sjsanjsrh@naver.com>
 * @version 1.1.3
 * @requires three.js
 */

/**
 * @class PanoramaPreview
 * @example
 * const panorama = new PanoramaPreview(document.getElementById("panorama"));
 * panorama.loadImage(imageurl)
 * .then(() => {
 *    panorama.enable();
 * });
 * panorama.beforeRender = (dt) => {
 *   panorama.yaw += dt*speed;
 * }
 * @property {number} pitch camera angle
 * @property {number} yaw camera angle
 * @property {number} roll camera angle
 * @property {function} beforeRender call before render()
 * @property {number} fov camera fov
 * @property {canvas} domElement
 * @param {canvas} domElement
 */
class PanoramaPreview{
    /** @private */
    _fov = 90;              //default value

    /** @member {number} camera angle */
    pitch = 0;
    /** @member {number} camera angle */
    yaw = 0;
    /** @member {number} camera angle */
    roll = 0;

    /** @member {function} call before render() */
    beforeRender = (dt) => {};

    /** @private */
    _WebGL_Active = false;
    /** @private */
    static _ActiveWebGLClasses = 0;

    /** @type {number} camera fov */
    static get fov() {}
    get fov(){
        return this._camera.fov;
    }
    set fov(value){
        this._camera.fov = value;
    }
    /** @return {canvas} domElement*/
    get domElement(){
        return this._domElement;
    }
    /** @returns {boolean} */
    get WebGL_Active(){
        return this._WebGL_Active;
    }
    /** @returns {number} number of active webgl classes*/
    static get ActiveWebGLClasses(){
        return this._ActiveWebGLClasses;
    }

    /**
     * 
     * @param {HtmlElement} domElement
     */
    constructor(domElement) {
        this._setWebglState(true);
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(this._fov, 1, 0.01, 1000);

        this._canvas = document.createElement("canvas")
        this._renderer = new THREE.WebGLRenderer({canvas: this._canvas});
        domElement.innerHTML = "";
        domElement.appendChild(this._canvas);
        this._domElement = domElement;
        this.setResolution();
        
        this._disable = true;
        
        this._privtime = performance.now();

        this._img = new Image();
        this._img.style.display = 'none';
        domElement.appendChild(this._img);

        this._img.onload = () => {
            this._img.style.display = '';
            this._canvas.style.display = 'none';
            this._renderer.forceContextLoss();
        }

        this._canvas.addEventListener('webglcontextlost', (event) => {
            this._img.style.display = '';
            this._canvas.style.display = 'none';
            this._setWebglState(false);
        });

        this._canvas.addEventListener('webglcontextrestored', (event) => {
            this._img.style.display = 'none';
            this._canvas.style.display = '';
            this._setWebglState(true);
        });

        this._animate = () => {
            if(this._disable){ //stop rendering
                this._renderer.render(this._scene, this._camera);
                this._img.src = this._domElement.firstElementChild.toDataURL();
                return;
            }

            let nowtime = performance.now();
            let dt = (nowtime - this._privtime)/1000;
            this._privtime = nowtime;

            this.beforeRender(dt);
            requestAnimationFrame(this._animate); //call next frame

            //set camera rotation
            this._camera.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            this._camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), this.pitch);
            this._camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), this.roll);

            this._renderer.render(this._scene, this._camera);
        }
    }

    _setWebglState(state){
        if(state!=this._WebGL_Active){
            this._WebGL_Active = state;
            this._ActiveWebGLClasses += state ? 1 : -1;
        }
    }

    /**
     * set size of camera view fit in the resolution
     * @param {number} resolution max size of view if undefined, use default value
     */
    setResolution(resolution){
        if(resolution === undefined){
            this.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
        }
        else{
            const radio = this.domElement.clientWidth/this.domElement.clientHeight;
            let h = 1, v = 1;
            if(radio > 1)
                v = 1/radio;
            else
                h = radio
            this.setSize(resolution*h, resolution*v);
        }
    }
    
    /**
     * set size of camera view
     * @param {number} width 
     * @param {number} height 
     */
    setSize(width, height){
        this._renderer.setSize(width, height, false);
        this._camera.aspect=width/height;
    }

    /**
     * start randering
     */
    enable() {
        if(this._disable){
            this._disable = false;
            this._setWebglState(true);
            this._renderer.forceContextRestore();
        }
        
        this._animate();
    }

    /**
     * stop randering
     */
    disable() {
        this._disable = true;
    }

    /**
     * load image and set it as background
     * @param {String} image image url
     * @returns {Promise} Promise object represents on the loaded texture
     * @promise {THREE.Texture} loaded texture
     * @fail {undefined} fail to load image
     * @example
     * panorama.loadImage(imageurl)
     * .then((texture) => {
     *   panorama.enable();
     * })
     */
    loadImage(image) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                image,
                (texture) => {
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    this._scene.background = texture;
                    this._scene.background.needsUpdate = true;
                    this.rotation = 0;
                    this._animate();
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }
}