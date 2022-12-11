/**
 * simple panorama viewer
 * @file panorama.js
 * @author Sinduy <sjsanjsrh@naver.com>
 * @version 1.0.1
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
    /** @private */
    _resolution = 192;      //default value

    /** @member {number} camera angle */
    pitch = 0;
    /** @member {number} camera angle */
    yaw = 0;
    /** @member {number} camera angle */
    roll = 0;

    /** @member {function} call before render() */
    beforeRender = (dt) => {};

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
        return this._renderer.domElement;
    }
    /**
     * 
     * @param {canvas} domElement
     */
    constructor(domElement) {

        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(this._fov, 1, 0.01, 1000);

        this._renderer = new THREE.WebGLRenderer({canvas: domElement});
        this.setResolution(this._resolution);
        
        this._disable = true;
        
        this._privtime = performance.now();
        this._animate = () => {
            if(this._disable){ //stop rendering
                this._renderer.render(this._scene, this._camera);
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
        this._disable = false;
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