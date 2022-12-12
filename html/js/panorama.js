/**
 * simple panorama viewer
 * @file panorama.js
 * @author Sinduy <sjsanjsrh@naver.com>
 * @version 1.1.4
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
 * @property {boolean} WebGL_Active
 * @property {number} ActiveWebGLClasses
 * 
 * @param {HtmlElement} domElement
 */
class PanoramaPreview{
    _fov = 90;              //default value

    pitch = 0;
    yaw = 0;
    roll = 0;

    beforeRender = (dt) => {};

    _WebGL_Active = false;
    static _ActiveWebGLClasses = 0;

    get fov(){
        return this._camera.fov;
    }
    set fov(value){
        this._camera.fov = value;
    }
    get domElement(){
        return this._domElement;
    }
    get WebGL_Active(){
        return this._WebGL_Active;
    }
    static get ActiveWebGLClasses(){
        return this._ActiveWebGLClasses;
    }

    constructor(domElement) {
        this._setWebglState(true);
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(this._fov, 1, 0.01, 1000);

        this._canvas = document.createElement("canvas")
        this._renderer = new THREE.WebGLRenderer({canvas: this._canvas});
        domElement.innerHTML = "";
        domElement.appendChild(this._canvas);
        this._domElement = this._canvas;
        this.setResolution();
        
        this._disable = true;
        
        this._privtime = performance.now();

        this._img = new Image();
        this._img.style.display = 'none';
        domElement.appendChild(this._img);

        this._img.onload = () => {
            this._setDomElementToImage();
            this._renderer.forceContextLoss();
        }

        this._canvas.addEventListener('webglcontextlost', (event) => {
            this._setDomElementToImage();
            this._setWebglState(false);
        });

        this._canvas.addEventListener('webglcontextrestored', (event) => {
            this._setDomElementToCanvas();
            this._setWebglState(true);
        });

        this._animate = () => {
            if(this._disable){ //stop rendering
                this._renderer.render(this._scene, this._camera);
                if(this.domElement == this._canvas)
                    this._img.src = this._canvas.toDataURL();
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

    _setDomElementToCanvas(){
        this._domElement = this._canvas;
        this._img.style.display = 'none';
        this._canvas.style.display = '';
    }
    _setDomElementToImage(){
        this._domElement = this._img;
        this._img.style.display = '';
        this._canvas.style.display = 'none';
    }

    _setWebglState(state){
        if(state!=this._WebGL_Active){
            this._WebGL_Active = state;
            this._ActiveWebGLClasses += state ? 1 : -1;
        }
    }

    /**
     * set size of camera view fit in the resolution
     * @instance
     * @param {number} resolution max size of view if undefined, use default value
     * @memberof PanoramaPreview
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
     * @instance
     * @param {number} width 
     * @param {number} height 
     * @memberof PanoramaPreview
     */
    setSize(width, height){
        this._renderer.setSize(width, height, false);
        this._camera.aspect=width/height;
    }

    /**
     * start randering
     * @instance
     * @memberof PanoramaPreview
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
     * @instance
     * @memberof PanoramaPreview
     */
    disable() {
        this._disable = true;
    }

    /**
     * load image and set it as background
     * @instance
     * @param {String} image image url
     * @returns {Promise} Promise object represents on the loaded texture
     * @promise {THREE.Texture} loaded texture
     * @fail {undefined} fail to load image
     * @example
     * panorama.loadImage(imageurl)
     * .then((texture) => {
     *   panorama.enable();
     * })
     * @memberof PanoramaPreview
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