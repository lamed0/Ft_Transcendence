/*  
    Notes and optimization

    using standard material given in babylonjs hide all complexity and offer great optimization for the game
    x:400 y:110  z: -100 color plight 0F2A6BFF and light 3D35B8FF with alpha

*/
import { setupNetwork, waiting_player, score , wsClient} from './client_game.js';
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as GUI from "@babylonjs/gui";
import {COURT_DEPTH, COURT_WIDTH} from './utils/constant.js';
// import { WebSocket, WebSocketServer } from 'ws';
import { Engine, Scene, Vector3, Axis, Space, Mesh, AxesViewer,HemisphericLight, ArcRotateCamera, SpotLight, Color3, Color4, ShadowGenerator, GlowLayer, PointLight, FreeCamera, UniversalCamera, CubeTexture, Sound, PostProcess, Effect, SceneLoader, Matrix, MeshBuilder, Quaternion, AssetsManager, Material, StandardMaterial, GroundMesh, Texture, KeyboardInfo, KeyboardEventTypes, SceneInstrumentation, DynamicTexture, FollowCamera, NullBlock} from "@babylonjs/core";
import earcut from 'earcut';
// import { PlayerInput } from "./inputController";
// import { Player } from "./characterController";
// import { Hud } from "./ui";
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Rectangle, Control, Image } from "@babylonjs/gui";
// import { Environment } from "./environment";
import {ball, Player1, Player2} from './client_game.js';
import { count } from 'console';
//enum for states
enum State { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 }


export class App {
    private _scene: Scene;
    private _camera: FollowCamera;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    //Game related
    // public assets;
    // private _input PlayerInput;
    // private _player: Player;
    // private _ui: Hud;
    private _environment;

    //Sounds
    // public sfx: Sound;
    public game: Sound;
    public end: Sound;

    //Scene - related
    private _state: number = 0;
    // private _state: number = 1;

    private _gamescene: Scene;
    private _cutScene: Scene;    
    private _transition: boolean = true;
    private cameraAnimationFinished = false;


    _createCanvas(){

        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        // create the canvas html element and attach it to the webpage
        let canvas = document.createElement("canvas");
        canvas.style.width = "100%";    
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);
        return canvas;
    };
        
    constructor() {
        // initialize babylon scene and engine and network
        this._canvas = this._createCanvas();
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);
        
        //lower the resolution for pixel art style
        this._engine.setHardwareScalingLevel(2.5);
        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I 
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });
        this._main();
        // run the main render loop
    }
    
    //we use async to be able to wait for assets and init to finish
    private async _main():Promise<void>{
        try {
            const setup_await = await setupNetwork();
            // Now the WebSocket is ACTUALLY connected and ready
            // console.log('setup_await : ', setup_await);
            // setup_await.catch(() => {
            //     console.log("fdfsdfsdfds");
            //     alert("Problem when setup connection");
            //     return;
            // });
            await waiting_player(); // Wait for opponent
            // Start your game loop
        } catch (error) {
            console.error('Failed to setup network:', error);
        }
        //load sounds assets for the game
        // await this._goToStart();
        await this._goToGame();
        //******* ##############change when ws is completed ##############*/
        //        #########################################################
        //        #########################################################
        //resize if the screen is resized/rotated
        this._engine.runRenderLoop(() => {
            if(!this.cameraAnimationFinished && this._camera){
                let previousPosition = this._camera.position.clone();
                const threshold = 0.001; // Adjust based on your needs
                // this._scene.onBeforeRenderObservable.add(() => {
                //     const positionDelta = Vector3.Distance(this._camera.position, previousPosition);
                //     console.log('position delta ' + positionDelta);
                //     if(positionDelta == 1000)
                //     {
                //         // broadcast({type: 'REQUEST_GAME_STATE'});
                //         this.cameraAnimationFinished = true;

                //     }
                // });
            }
            switch(this._state){
                // case State.START:
                //     this._scene.render();
                //     break;
                case State.GAME:
                    this._scene.render();
                    break;
                // case State.CUTSCENE:
                //     this._scene.render();
                //     break;
                case State.LOSE:
                    this._scene.render();
                    break;
                default:
                    break;
            }
            // update(this._engine.getDeltaTime());
            // if(this._scene.metadata){
                const Paddle1 = this._scene.metadata.Paddle1;
                const Paddle2 = this._scene.metadata.Paddle2;
                const Ball = this._scene.metadata.Ball;
                const scoreP1 = this._scene.metadata.scoreP1;
                const scoreP2 = this._scene.metadata.scoreP2;
                const update_digit = this._scene.metadata.update_digit;
                if(Paddle1 && Paddle2 && Ball)
                {
                    // Fix coordinate mapping - game X maps to 3D Z, game Y maps to 3D X
                    Paddle1.position = new Vector3(Player1.y + 100/2 ,0,Player1.x );
                      Paddle2.position = new Vector3(Player2.y + 100/2,0,Player2.x );
                    
                    // Fix ball coordinates - X and Y were swapped
                    Ball.position = new Vector3(ball.y, ball.radius, ball.x);
                    //update the score board
                    update_digit(scoreP1.texture, score[0], 120);
                    update_digit(scoreP2.texture, score[1], 120);
                }
            // }
            this._scene.render();
        });



        window.addEventListener('resize', () => {
            this._engine.resize();
        });

    }
    private async _goToStart(){
        this._engine.displayLoadingUI(); //make sure to wait for start to load

        this._scene.detachControl();
        let startScene : Scene = new Scene(this._engine);
        startScene.clearColor =  new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), startScene);
        camera.setTarget(Vector3.Zero());
        //--UI 
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;
        const imageRect = new Rectangle("titleContainer");
        imageRect.width = 0.8;
        imageRect.thickness = 0;
        guiMenu.addControl(imageRect);

        const startbg = new Image("startbg", "sprites/menu_img.jpeg");
        imageRect.addControl(startbg);

        const title = new TextBlock("title", "PING PONG beta v0.1");
        title.resizeToFit = true;
        title.fontFamily = "sans-serif";
        title.fontSize = "64px";
        title.color = "white";
        title.resizeToFit = true;
        title.top = "14px";
        title.width = 0.8;
        title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        imageRect.addControl(title);

        const startBtn = Button.CreateSimpleButton("start", "PLAY");
        startBtn.fontFamily = "Viga";
        startBtn.width = 0.2
        startBtn.height = "40px";
        startBtn.color = "white";
        startBtn.top = "-14px";
        startBtn.thickness = 0.3;
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        imageRect.addControl(startBtn);


        Effect.RegisterShader("fade",
            "precision highp float;" +
            "varying vec2 vUV;" +
            "uniform sampler2D textureSampler; " +
            "uniform float fadeLevel; " +
            "void main(void){" +
            "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
            "baseColor.a = 1.0;" +
            "gl_FragColor = baseColor;" +
            "}");

        // let fadeLevel = 1.0;
        this._transition = false;
        startScene.registerBeforeRender(() => {
            if (this._transition) {
                // fadeLevel -= .05;
                // if(fadeLevel <= 0){
                    this._goToGame();
                    this._transition = false;
                // }
            }
        })

        //this handles interactions with the start button attached to the scene
        startBtn.onPointerDownObservable.add(() => {
            //fade screen
            const postProcess = new PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, camera);
            postProcess.onApply = (effect) => {
                // effect.setFloat("fadeLevel", fadeLevel);
            };
            this._transition = true;
            //sounds

            startScene.detachControl(); //observables disabled
        });



        await startScene.whenReadyAsync();
        
        // Wait for the timeout to complete before hiding loading UI
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this._engine.hideLoadingUI();
        this._scene.dispose();
        this._scene = startScene;
        this._state = State.START;


    }
    private async _goToGame(): Promise<void>{

        let scene : Scene = new Scene(this._engine);
        //for debuging purposes

        scene.debugLayer.show({
        initialTab: 2, // Start on a specific tab (e.g., 0 for Scene Explorer, 1 for Inspector, 2 for Debug)

            });
        // let camera : UniversalCamera = new UniversalCamera("UniversalCamera", new Vector3(283, 238, -4), scene);
        //camera coordinates /1700 723 550
   
        // let camera : FreeCamera = new FreeCamera("FreeCamera", new Vector3(2020, 849, 549), scene);
        let camera : FollowCamera = new FollowCamera("Follow table", new Vector3(0,0,0), scene);
        camera.heightOffset = 1000;
        camera.cameraAcceleration = 0.010;
        camera.maxCameraSpeed = 1;
        camera.rotationOffset = 90;
        camera.radius = 700;
        // const camera = new ArcRotateCamera(
        // "ArcCamera",
        // 6.283,            // Alpha (from screenshot)
        // 1.1545,           // Beta (from screenshot)
        // 2528.0681,        // Radius (from screenshot)
        // new Vector3(200, 0, 400), // Target (from screenshot)
        // scene
        // );

        // camera.fov = 0.4683;
        // enable input on the canvas and set active camera so scene receives keyboard events
        // camera.attachControl(this._canvas, true);
        scene.activeCamera = camera;
        this._camera = camera;
        // ensure canvas can receive focus (useful if attachControl alone doesn't)
        this._canvas.tabIndex = 0;
        this._canvas.style.outline = "none";
        this._canvas.focus();
        
        scene.ambientColor = new Color3(0.3, 0.3, 0.3);
        var light1: HemisphericLight = new HemisphericLight("light", new Vector3(0, 2, 0), scene);
        // Use a 6-digit hex (no alpha) — Color3.FromHexString expects RGB
        light1.diffuse = Color3.FromHexString("#17579C");
        light1.intensity = 1.0;
        var light : PointLight = new PointLight("plight", new Vector3(700, 200, -100 - COURT_WIDTH/2), scene);
        //difusse color 17579CFF posistion 300 200 -100
        light.diffuse = Color3.FromHexString("#D664D5");
        // const ground: GroundMesh = MeshBuilder.CreateGround("ground", {height: 4500, width: 2550, subdivisions: 4});
        // const axes = new AxesViewer(scene, 2);
        //1107 × 554 
        const WALL_HEIGHT : number = 1;
        const WALL_THICKNESS : number = 0.2;
        const texture_floor : Texture = new Texture("sprites/table_ping.jpeg", scene);
        texture_floor.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
        const Paddle_h : number = 20;
        const Paddle_w : number = 100;
        
        //Court object
        const floor = MeshBuilder.CreateBox("poolFloor", { width: COURT_WIDTH, height: 0.4, depth: COURT_DEPTH }, scene);
        floor.position = new Vector3(COURT_WIDTH / 2, 0, COURT_DEPTH/2);
        //Paddles
        const Paddle1 = MeshBuilder.CreateBox("paddle1", { width: Paddle_w, height: 50, depth: Paddle_h }, scene);
        // Paddle1.position = new Vector3(1,0,-COURT_DEPTH/2 + 40);
        Paddle1.position = new Vector3(Player1.y - 100/2,0,Player1.x + COURT_DEPTH/2);
        
        const Paddle2 = MeshBuilder.CreateBox("paddle2", { width: Paddle_w, height: 50, depth: Paddle_h }, scene);
        // Paddle2.position = new Vector3(1,0,COURT_DEPTH/2 - 40);
        Paddle2.position = new Vector3(Player2.y,0, Player2.x + COURT_DEPTH/2);
        //BALL
        const Ball = MeshBuilder.CreateSphere("ping pong ball" , {diameter: 25}, scene);
  
        Ball.position = new Vector3(ball.x, ball.radius, ball.y);

        const floorMat: StandardMaterial = new StandardMaterial("floorMat", scene);
        floorMat.emissiveTexture = texture_floor;
        floor.material = floorMat;

        const createScoreBoard = (name: string, position: Vector3, size: object)=>{
            const plane = MeshBuilder.CreatePlane(name, size, scene);
            plane.position = position;
            plane.rotation =  new Vector3(0, Math.PI / 2 + Math.PI, 0);

            const texture = new DynamicTexture(
            name + "Texture",
            { width: 512, height: 256 },
            scene,
            false);
            texture.hasAlpha = true;
            texture.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
            const material = new StandardMaterial(name + "Mat", scene);
            material.diffuseTexture = texture;
            material.emissiveColor = Color3.White(); // stays bright
            material.disableLighting = true;
            material.backFaceCulling = false;          // show both faces

            plane.material = material;
            return { plane, texture };

        };
        const scoreP1 = createScoreBoard(
        "scoreP1",
        new Vector3(COURT_WIDTH / 4, 150, COURT_DEPTH / 4),
        {width: 400, height: 160}
        );

        const scoreP2 = createScoreBoard(
        "scoreP2",
        new Vector3(
        COURT_WIDTH / 4,
        150,
        COURT_DEPTH - COURT_DEPTH / 3.2,
        ),
        {width: 400, height: 160}
        );

        const update_digit = async (texture: DynamicTexture, value : number, size: number) => {
        const ctx = texture.getContext();
        ctx.clearRect(0, 0, 512, 256);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
        document.head.appendChild(link);
        // Use custom font from public/font
        try{
            await document.fonts.ready;
            // const newFont = new FontFace(fontName, 'url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap")');
            // const loadfont = await newFont.load();
            // document.fonts.add(loadfont);
            ctx.font = size.toString() + 'px "Press Start 2P"';
            const my_gradient = ctx.createLinearGradient(0, 0, 0, 170);
            my_gradient.addColorStop(0, "purple");
            my_gradient.addColorStop(1, "lightblue");
            ctx.fillStyle = my_gradient;
            // ctx.textAlign = "center";
            // ctx.textBaseline = "middle";
            ctx.fillText(value.toString(), 256, 128);
        }
        catch(error){
            console.error("Error loading font:", error);
            ctx.font = "bold 120px sans-serif";
            ctx.fillStyle = "white";
            // ctx.textAlign = "center";
            // ctx.textBaseline = "middle";
            ctx.fillText(value.toString(), 256, 128);
        }

            texture.update();
        };
        update_digit(scoreP1.texture, score[0], 120);
        update_digit(scoreP2.texture, score[1], 120);
        scene.metadata = {
        Paddle1 : Paddle1,
        Paddle2 : Paddle2,
        Ball : Ball,
        scoreP1: scoreP1,
        scoreP2: scoreP2,
        update_digit : update_digit,

        }
        try {
            const result = await SceneLoader.ImportMeshAsync(
                "", 
                "./models/", 
                "lobby.glb", 
                scene
            );
            result.meshes.forEach(mesh => {
                if (mesh.material) {
                    mesh.material.backFaceCulling = false;
                    // This tells Babylon to calculate light for both sides of the face
                    // if (mesh.material.twoSidedLighting !== undefined) {
                    //     mesh.material.twoSidedLighting = true;
                    // }
                }
            });
            // Access your data via the result object
            const meshes = result.meshes;
                meshes[0].position = new Vector3(COURT_WIDTH / 2, 0, COURT_DEPTH/2);
                meshes[0].scaling = new Vector3(60, 60, 60);
                meshes[0].rotation.x = -Math.PI / 2;
            const particleSystems = result.particleSystems;
            const skeletons = result.skeletons;
            console.log("Model loaded successfully!");
        } catch (error) {
            console.error("Error loading mesh:", error);
        }
        camera.lockedTarget = floor; //version 2.5 onwards
        await scene.whenReadyAsync();
        this._scene.dispose();
        this._scene = scene;
        this._state = State.GAME;
        let flag_animation : boolean = false;
        this._scene.onBeforeRenderObservable.add(() => {
        const heightdelta = 1000 - camera.position.y ;
        // console.log(heightdelta);
        if(heightdelta <= 100 && !flag_animation)
        {
            flag_animation = true;
            //start the countdown
            const countdown = createScoreBoard(
            "countdown",
            new Vector3(
            COURT_DEPTH /2 - 100,
            150,
            COURT_DEPTH / 2 - 60
            ),
            {width: 600, height: 600}
            );
            update_digit(countdown.texture, 3, 100);
            setTimeout(()=> { update_digit(countdown.texture, 2, 100);}, 1000);
            setTimeout(()=> { update_digit(countdown.texture, 1, 100);}, 1800);
            setTimeout(()=> {countdown.texture.dispose()}, 3100);
            // update_digit(countdown.texture, 1, 100);
        }
        if(heightdelta < 1 && this.cameraAnimationFinished == false)
        {
            console.log('position delta ' + heightdelta );
            broadcast({type: 'REQUEST_GAME_STATE'});
            this.cameraAnimationFinished = true;
    
        }});

    }
}
new App();

function broadcast(msg : Object ){
if(!wsClient || wsClient.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not ready, cannot send message');
    return;
}
wsClient.send(JSON.stringify(msg));
}