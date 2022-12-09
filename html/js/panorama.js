class PanoramaPreview{
    static geometry = new THREE.SphereGeometry(1, 24, 8);
    _fov = 90;              //default value
    _resolution = 192;      //default value
    pitch = 0;
    yaw = 0;
    roll = 0;

    beforeRender = (dt) => {};

    get fov(){
        return this._camera.fov;
    }
    set fov(value){
        this._camera.fov = value;
    }
    get domElement(){
        return this._renderer.domElement;
    }

    constructor(domElement) {

        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(this._fov, 1, 0.01, 1000);

        this._renderer = new THREE.WebGLRenderer({canvas: domElement});
        this.setResolution(this._resolution);
        
        this._disable = false;
        
        this._privtime = performance.now();
        this._animate = () => {
            if(this._disable){
                this._renderer.render(this._scene, this._camera);
                return;
            }

            let nowtime = performance.now();
            let dt = (nowtime - this._privtime)/1000;
            this._privtime = nowtime;

            this.beforeRender(dt);
            requestAnimationFrame(this._animate);
            this._camera.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            this._camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), this.pitch);
            this._camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), this.roll);

            this._renderer.render(this._scene, this._camera);
        }
    }

    setResolution(resolution){
        const radio = this.domElement.clientWidth/this.domElement.clientHeight;
        let h = 1, v = 1;
        if(radio > 1)
            v = 1/radio;
        else
            h = radio
        this.setSize(resolution*h, resolution*v);
    }
    
    setSize(width, height){
        this._renderer.setSize(width, height, false);
        this._camera.aspect=width/height;
    }

    enable() {
        this._disable = false;
        this._animate();
    }

    disable() {
        this._disable = true;
    }

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