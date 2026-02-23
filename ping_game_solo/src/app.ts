/*  
    Notes and optimization

    using standard material given in babylonjs hide all complexity and offer great optimization for the game
    x:400 y:110  z: -100 color plight 0F2A6BFF and light 3D35B8FF with alpha
    handle the disconnection from the server in case of the port in use
    when load audio manager init block scene rendering for error message
    dispose all object for speed efficicy
*/
(function() {
    const org = HTMLCanvasElement.prototype.getContext;
    // @ts-ignore
    HTMLCanvasElement.prototype.getContext = function(type, attributes) {
        const context = org.apply(this, arguments);
        if (context && context.getExtension) {
            const originalGetExtension = context.getExtension;
            context.getExtension = function(name: string) {
                if (name === 'WEBGL_debug_renderer_info') return null;
                return originalGetExtension.apply(this, arguments);
            };
        }
        return context;
    };
})();
import { setupNetwork, score , wsClient, front_side} from './client_game.js';
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as GUI from "@babylonjs/gui";
import {COURT_DEPTH, COURT_WIDTH, POWER_UPS_SIZE, Paddle_h, Paddle_w} from './utils/constant.js';
import { Engine, Scene, Animation,Vector3, CreateAudioEngineAsync, StaticSound, DefaultRenderingPipeline,CreateSoundAsync, Space, Mesh, AxesViewer,HemisphericLight, ArcRotateCamera, SpotLight, Color3, Color4, ShadowGenerator, GlowLayer, PointLight, FreeCamera, UniversalCamera, CubeTexture, Sound, PostProcess, Effect, SceneLoader, Matrix, MeshBuilder, Quaternion, AssetsManager, Material, StandardMaterial, GroundMesh, Texture, KeyboardInfo, KeyboardEventTypes, SceneInstrumentation, DynamicTexture, FollowCamera, NullBlock, Plane, bilateralBlurPixelShader, FlowGraphConsoleLogBlock} from "@babylonjs/core";
// import earcut from 'earcut';
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Rectangle, Control, Image } from "@babylonjs/gui";
// import { Environment } from "./environment";
import {ball, Player1, Player2, PwrState, payload} from './client_game.js';
import { create } from 'domain';
//enum for states
enum State { START = 0, GAME = 1, LOSE = 2, WIN = 3 , GAME_OVER = 4, COUNTDOWN = 5}
enum PowerUpPath {"LONG_PADDLE" = "models/power1.png", "FAST_BALL" = "models/power2.png", "FAST_PADDLE" = "models/power4.png", "SLOW_PADDLE" = "models/power3.png"}

interface ScoreboardElement{
    plane : Mesh;
    texture: DynamicTexture;
    name : string;
    value : number;

}
// declare global {
//   interface Window {
//     Players: {
//       Me: string;
//       opponent: string;
//     };
//   }
// }
// window.Players = {
//     Me: "Player1",
//     opponent: "Player2"
// };
// export {};
let Myid : string = null;
let Opponent : string = null;
class renderUI{
    private scene : Scene;
    private boards: Map<string, ScoreboardElement>;
    private matchScores: Map<string, GUI.TextBlock[]>; // Store M1, M2, M3 for each player

    
    constructor(scene: Scene) {
        this.scene = scene
        this.boards = new Map()
        this.matchScores = new Map()
    }
    async create_popuptext(scene: Scene, position : Vector3, parent: Mesh, timerMs: number, size: number, Content: string){
        // 1. Point to your local JSON font file
        // If using Vite/Webpack, this is usually relative to your 'public' folder
        // (window as any).earcut = earcut;
        const response = await fetch("./fonts/Press Start 2P_Regular.json");
        
        if (!response.ok) {
            console.error("Failed to load font file. Check the path!");
            return;
        }

        const fontData = await response.json();

        // 2. Create the 3D text mesh
        const textMesh = MeshBuilder.CreateText("3dText", Content, fontData, {
            size: size,
            resolution: 4,
            depth: 2,
        }, scene);

        // Position it as needed
        if(position)
            textMesh.position = new Vector3(position.x, position.y, position.z);
        else if(parent)
            textMesh.parent = parent;
        textMesh.freezeWorldMatrix();
        // 3. Optional: Material
        const textMaterial = new StandardMaterial("textMat", scene);
        textMaterial.diffuseColor = new Color3(1, 0, 0); 
        textMesh.material = textMaterial;

        return textMesh;
    }
    createHUD(name: string, position: Vector3){
        // Create the AdvancedDynamicTexture for the HUD
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Main vertical stack
        const mainStack = new GUI.StackPanel();
        mainStack.width = "150px";
        mainStack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        mainStack.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        mainStack.top = "15px";
        mainStack.left = "15px";
        advancedTexture.addControl(mainStack);

        // Function to create a player row
        const createPlayerRow = (name :string, color : string, setScore : number, gameScore : number) => {
            const rect = new GUI.Rectangle();
            rect.height = "50px";
            rect.background = color;
            rect.color = "white"; // Border color
            rect.thickness = 0;
            
            const grid = new GUI.Grid();
            grid.addColumnDefinition(0.05); // Icon
            grid.addColumnDefinition(0.18); // Name
            grid.addColumnDefinition(0.25); // Set Score
            grid.addColumnDefinition(0.25); // Game Score
            grid.addColumnDefinition(0.25); // Game Score

            rect.addControl(grid);

            // Add Name
            const textName = new GUI.TextBlock();
            textName.text = name;
            textName.color = "white";
            textName.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            textName.fontSize = "45%";
            grid.addControl(textName, 0, 1);

            // Add Set Score (Yellow)
            const M1 = new GUI.TextBlock();
            M1.text = setScore.toString();
            M1.color = "yellow";
            M1.paddingLeft = "8px";
            M1.paddingRight = "8px";
            M1.fontSize = "42%";
            grid.addControl(M1, 0, 2);
            
            const M2 = new GUI.TextBlock();
            M2.text = setScore.toString();
            M2.color = "yellow";
            M2.paddingLeft = "8px";
            M2.paddingRight = "8px";
            M2.fontSize = "42%";
            grid.addControl(M2, 0, 3);  
            const M3 = new GUI.TextBlock();
            M3.text = setScore.toString();
            M3.color = "yellow";
            M3.paddingLeft = "8px";
            M3.paddingRight = "8px";
            M3.fontSize = "42%";
            grid.addControl(M3, 0, 4);
            return {rect, scores: [M1, M2, M3]};
        };

        const player1Row = createPlayerRow("P1", "HotPink", 0, 2);
        const player2Row = createPlayerRow("P2", "darkblue",0, 1);
        
        mainStack.addControl(player1Row.rect);
        mainStack.addControl(player2Row.rect);
        
        // Store match scores for later updates
        this.matchScores.set("player1", player1Row.scores);
        this.matchScores.set("player2", player2Row.scores);
    }
    
    updateMatchScores(player: string, score: number, round: number) {
        const scoreBlocks = this.matchScores.get(player);
        if (scoreBlocks && score >= 0 && round >= 1 && round <= 3) {
            scoreBlocks[round - 1].text = score.toString();
        }
    }
    createScoreBoard(name: string, parent:Mesh,position: Vector3, size: object){
        const plane = MeshBuilder.CreatePlane(name, size, this.scene);
        plane.position = position;
        plane.rotation =  new Vector3(0, Math.PI / 2 + Math.PI, 0);
        const texture = new DynamicTexture(
        name + "Texture",
        { width: 512, height: 256 },
        this.scene,
        false);
        texture.hasAlpha = true;
        texture.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
        const material = new StandardMaterial(name + "Mat", this.scene);
        material.diffuseTexture = texture;
        material.emissiveColor = Color3.White();
        material.disableLighting = true;
        material.backFaceCulling = false;

        plane.material = material;
        return { plane, texture };

    };
    async update_text(texture: DynamicTexture, value : string, size: number){

        const ctx = texture.getContext() as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, 512, 256);
        try{
            await document.fonts.ready;
            ctx.font = size.toString() + 'px "Press Start 2P"';
            const my_gradient = ctx.createLinearGradient(0, 0, 0, 170);
            my_gradient.addColorStop(0, "#8f3cdd"); // Deep Imperial Purple
            my_gradient.addColorStop(1, "#ec9090");
            ctx.fillStyle = my_gradient;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            // Text wrapping logic
            const maxWidth = 180; // Leave padding from canvas edges
            const lineHeight = size * 1.2;
            const words = value.split(' ');
            const lines: string[] = [];
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) lines.push(currentLine);

            // Calculate block height and starting Y position
            const blockHeight = lines.length * lineHeight;
            const startY = 128 - (blockHeight / 2) + (lineHeight / 2);

            // Draw centered lines
            lines.forEach((line, index) => {
                ctx.fillText(line, 256, startY + (index * lineHeight));
            });
        }
        catch(error){
            console.error("Error loading font:", error);
            ctx.font = "bold 120px sans-serif";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(value, 256, 128);
        }
        texture.update();
    };
    // Function to create the FIFA indicator
    createPlayerIndicator(scene :Scene, playerPaddle : Mesh) {
        // 3 sides = Triangle
        const indicator = MeshBuilder.CreateCylinder("playerTriangle", {
            diameter: 0.5, 
            height: 0.1, 
            tessellation: 3 
        }, scene);

        // Material setup (Red or Neon Green works best)
        const indicatorMat = new StandardMaterial("indicatorMat", scene);
        indicatorMat.diffuseColor = new Color3(1, 0, 0); // FIFA Red
        indicatorMat.emissiveColor = new Color3(0.5, 0, 0); // Make it glow slightly
        indicator.material = indicatorMat;

        // Position it
        indicator.rotation.x = 0; // Flip it to face the camera/ground
        indicator.rotation.z = -Math.PI/2;     // Point the tip downward
        indicator.rotation.y = Math.PI/2;     // Point the tip downward
        indicator.position.y = 200;
        indicator.scaling = new Vector3(100, 100, 100);
        // Parent it to the paddle so it follows automatically
        // indicator.parent = playerPaddle;a
        
        // Lift it above the paddle (adjust Y based on your paddle size)
        indicator.position.y = 1.5; 

        return indicator;
    };
}
class PowUpsRender{
    private scene : Scene;
    private powUpsMeshes :  Map<string,Mesh>;
    private TableMesh : Mesh;
    private App_instance : App;
    private powUpsData : Array<{type: string, id: string, target : string}> = [];
    //know the type associate with ui and change
    private powUpsUI : Map<string, any>;
    constructor(scene : Scene, Table: Mesh, App : App){
        this.scene = scene;
        this.powUpsMeshes = new Map();
        this.powUpsUI = new Map();
        this.TableMesh = Table;
        this.App_instance = App;

    }
    //update the already spawned power ups and create the newly spawnd powerups
    update(powUpState: any){
        //call updateSpawnedPowups and updatespawndpowup ui
        if(powUpState){
            this.updateActivePowUps(); 
            this.updateSpawnedPowUps(powUpState.spawned);
            if(powUpState.active){
                for(let i = 0; i < powUpState.active.length; i++){
                    const active = powUpState.active[i];
                    const id = active.id;
                    if(this.powUpsData.find(item => item.id === id)){
                        continue;
                    }

                    // Support either "target" or "targetPaddle" naming coming from server
                    const targetIndex = (active.target !== undefined) ? active.target : active.targetPaddle;
                    const target = targetIndex === 0 ? "paddle1" : "paddle2";

                    if(active.type === "FAST_BALL"){
                        const ball : Mesh | undefined = this.App_instance._meshes.find(element => element.name === "ball_mesh") as Mesh | undefined;
                        const mat = this.App_instance._materials.find(element => element.name === "red");
                        if(ball && mat){
                            ball.material = mat;
                            this.powUpsData.push({type: "FAST_BALL", id: id, target: ""});
                        } else {
                            console.warn("FAST_BALL: missing ball mesh or material");
                        }
                        
                    }
                    else if (active.type === "FAST_PADDLE" || active.type === "SLOW_PADDLE" || active.type === "LONG_PADDLE"){
                        const paddle : Mesh | undefined = this.App_instance._meshes.find(element => element.name === target) as Mesh | undefined;
                        let matName = "";
                        if(active.type === "FAST_PADDLE") matName = "red";
                        else if(active.type === "SLOW_PADDLE") matName = "blue";
                        else if(active.type === "LONG_PADDLE") matName = "orange";

                        const mat = this.App_instance._materials.find(element => element.name === matName);
                        if(paddle && mat){
                            paddle.material = mat;
                            this.powUpsData.push({type: active.type, id: id, target: target});
                        }
                    }
                }
            }
        }
    }
    updateActivePowUps(){
        //search for removed power up and restore the material of the target and remove from poweupdata
        this.powUpsData.forEach((powUp, index) =>{
            //if id is not found in the active power up 
            if(!PwrState.active.find((p) => p.id === powUp.id))
            {
                if(powUp.type === "FAST_BALL"){
                    const ball : Mesh = this.App_instance._meshes.find(element => element.name === "ball_mesh");
                    ball.material = null;
                    this.powUpsData.splice(index, 1);
                }
                else {
                    const paddle : Mesh = this.App_instance._meshes.find(element => element.name === powUp.target);
                    paddle.material = null;
                    this.powUpsData.splice(index, 1);
                }
            }
        });
    }
    updateSpawnedPowUps(spawned : Array<any>){
        this.powUpsMeshes.forEach((mesh, id) =>{

            if(!spawned.find(p => p.id === id))
            {
                mesh.dispose();
                this.powUpsMeshes.delete(id);
                // console.log("mesh removed success");
            } 
        });
        //create spawned mesh if not render
        spawned.forEach(powerup => {
        if (!this.powUpsMeshes.has(powerup.id)) {
            const mesh = this.createPowUpMesh(powerup);
            this.powUpsMeshes.set(powerup.id, mesh);
        }
        //for falling power ups later
        // const mesh = this.powUpsMeshes.get(powerup.id);
        // mesh.position = new Vector3(
        //     powerup.position.x,
        //     powerup.position.y,
        //     powerup.position.z
        // );
        });
    
    }
    updatePowUpsUI(){}
    createPowUpMesh(powerup: any){
        // create plane mesh with name of powerup and put texture
        // dont forget to change the size in game.js for the created meshes
        const Powup_mesh : Mesh = MeshBuilder.CreateBox("powerUp", {
            width: POWER_UPS_SIZE,
            height: POWER_UPS_SIZE,
            depth: 15  // Thin depth makes it look like a floating icon/chip
        }, this.scene);
        Powup_mesh.parent = this.TableMesh;
        Powup_mesh.rotation.x = Math.PI / 2;
        Powup_mesh.rotation.y =  3 * Math.PI/2 ;
        Powup_mesh.position = new Vector3(powerup.position.x, powerup.position.y, powerup.position.z);

        const material : StandardMaterial = new StandardMaterial("fastPaddleMat", this.scene);
        const texture : Texture = new Texture(PowerUpPath[powerup.type], this.scene);
        texture.hasAlpha = true;

        // Use emissive texture and disable lighting so the texture is shown without being tinted by lights or material color
        material.emissiveTexture = texture;
        material.diffuseTexture = texture; // keep diffuse for compatibility, but emissive drives the color
        material.useAlphaFromDiffuseTexture = true;
        material.disableLighting = true;
        material.backFaceCulling = false;
        material.emissiveColor = Color3.White();

        Powup_mesh.material = material;

        return Powup_mesh;
    }
    
}
class AudioManager {
    private scene: Scene;
    private sounds: Map<string, StaticSound>;
    public audioEngine : any;
    public async init_engine():Promise<void>{
        return new Promise(async (resolve) => {
            // Create a styled overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            cursor: pointer;
            `;

            overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <h1 style="
        font-family: 'Press Start 2P', 'Arial Black', sans-serif;
        font-size: 56px;
        margin-bottom: 20px;
        ">Click to Start Game</h1>
                <p>Audio will be enabled</p>
            </div>
            `;

            document.body.appendChild(overlay);

            overlay.addEventListener('click', async () => {
                this.audioEngine = await CreateAudioEngineAsync({ listenerEnabled: true, disableDefaultUI: true});
                await this.audioEngine.unlockAsync(); 
                await this.loadBackgroundMusic("fifa", "sounds/rcaCrowd.mp3");
                await this.loadMusic("goal", "sounds/GoalCeleb.mp3");
                overlay.style.display = 'none';
                resolve(); // Resolve the promise when audio is ready
            });
        });
    }

    constructor(scene: Scene) {
        //init the audio engine
        // this.scene = scene;
        this.sounds = new Map(); // Store sounds by key
 
    }

    // Load a global sound (e.g., Background Music)
    async loadBackgroundMusic(name: string, url: string) {
        const music = await CreateSoundAsync(name, url,  { loop: true });
    //, this.scene, null, {
    //        loop: true,
    //        autoplay: false,
    //        volume: 0.5
    //    });
        //catch error if music fails to load
        music.volume = 0.2;
        this.sounds.set(name, music);
        const music_check = this.sounds.get(name);
        if(music_check)
            // console.log('music check is sucess');
        if(!music_check)
            console.error("Error while setting the music");

    }
    async loadMusic(name: string, url: string) {
        const soundEffect = await CreateSoundAsync(name, url);

        soundEffect.volume = 0.2;
        this.sounds.set(name, soundEffect);
        const soundEffect_check = this.sounds.get(name);
        if(soundEffect_check)
            // console.log('soundEffect check is sucess');
        if(!soundEffect_check)
            console.error("Error while setting the soundEffect");

    }
    // Load a spatial sound (e.g., an engine hum or a bouncing ball)
    // loadSpatialSound(name, url, mesh) {
    //     const sfx = new Sound(name, url, this.scene, null, {
    //         loop: false,
    //         autoplay: false,
    //         spatialSound: true,
    //         distanceModel: "exponential", // Volume drops as you move away
    //         maxDistance: 100
    //     });
        
    //     // Attach the sound to a mesh so it follows it
    //     sfx.attachToMesh(mesh);
    //     this.sounds.set(name, sfx);
    // }

    play(name: string) {
        const music = this.sounds.get(name);
        if (music) {
            music.play();
        }
        else
            console.error("error while playing the music: " + name);
    }

    stop(name : string) {
        if (this.sounds.has(name)) {
            this.sounds.get(name).stop();
        }
    }
}
export class App {
    private _scene: Scene;
    private _camera: FollowCamera;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    public _meshes: Array<Mesh> = [];
    public _materials : Array<Material> = [];
    private _renderUI: renderUI;

    //Game related
    // public assets;
    // private _input PlayerInput;
    // private _player: Player;
    // private _ui: Hud;
    private _environment;
    public side : number;
    //Sounds
    // public sfx: Sound;
    public AudioManager: AudioManager;
    public PowUpsRender : PowUpsRender;
    //Scene - related
    private _state: number = 1;
    // private _state: number = 1;
    private mypayload;
    private _gamescene: Scene;
    private _cutScene: Scene;    
    private _transition: boolean = true;
    private cameraAnimationFinished = false;
    private score_updates: number[] = [score[0], score[1]];

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
        this.mypayload = {state: null};
        //lower the resolution for pixel art style
        this._engine.setHardwareScalingLevel(1.6);
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
    private _init_material(scene: Scene) : void {
        // Create a material
        const red_material = new StandardMaterial("red", scene);
        red_material.diffuseColor = new Color3(1.0, 0.0, 0.0);

        const blue_material = new StandardMaterial("blue", scene);
        blue_material.diffuseColor = new Color3(0.0, 0.0, 1.0);

        const orange_material = new StandardMaterial("orange", scene);
        orange_material.diffuseColor = new Color3(1.0, 0.5, 0.0);

        this._materials.push(red_material);
        this._materials.push(blue_material);
        this._materials.push(orange_material);
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
            this.side = front_side;
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
        this._engine.runRenderLoop(async () => {
            if(payload && ((this.mypayload.state === null && payload.state) || payload.state != this.mypayload.state))
            {
                this.mypayload = payload;
                switch(this.mypayload.state){
                    case "ROUND_OVER":
                        // console.log("Scores: P1: " + this.mypayload.score[0] + " | P2: " + this.mypayload.score[1]);

                        // Show animation (you can enhance this with UI overlays, camera effects, etc.)
                         const status_board = this._renderUI.createScoreBoard(
                        "status_board", null,
                        new Vector3(
                        COURT_DEPTH /2 - 100,
                        450,
                        COURT_DEPTH / 2
                        ),
                        {width: 1900, height: 900}
                        );
                        const text = "Match over: P" + (this.mypayload.roundWinner === 1 ? "1" : "2") + " win"; 
                        this._renderUI.update_text(status_board.texture, text, 20);
                        //animation for text block
                        const frameRate = 60;

                        const xSlide = new Animation("xSlide", "position.y", frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);

                        const keyFrames = []; 

                        keyFrames.push({
                            frame: 0,
                            value: 450
                        });

                        keyFrames.push({
                            frame: 90,
                            value: 310
                        });

                        keyFrames.push({
                            frame: frameRate * 3,
                            value: 100
                        });

                        xSlide.setKeys(keyFrames);

                        status_board.plane.animations.push(xSlide);

                        this._scene.beginAnimation(status_board.plane, 0, frameRate * 3, false);
                        setTimeout(()=> {status_board.texture.dispose();
                                        status_board.plane.dispose();
                        }, 2700);
                        this._renderUI.updateMatchScores("player1", this.mypayload.score[0], this.mypayload.round);
                        this._renderUI.updateMatchScores("player2", this.mypayload.score[1], this.mypayload.round);
                        break;
                    case "COUNTDOWN":
                        // Show countdown UI before next round
                        // console.log("Starting countdown for Round " + this.mypayload.round);
                        // Countdown is handled by showing 3-2-1
                        const countdown = this._renderUI.createScoreBoard(
                        "countdown", null,
                        new Vector3(
                        COURT_DEPTH /2 - 200,
                        150,
                        COURT_DEPTH / 2
                        ),
                        {width: 600, height: 600}
                        );
                        this._renderUI.update_text(countdown.texture, "3", 100);
                        setTimeout(()=> { this._renderUI.update_text(countdown.texture, "2", 100);}, 1000);
                        setTimeout(()=> { this._renderUI.update_text(countdown.texture, "1", 100);}, 1800);
                        setTimeout(()=> {countdown.texture.dispose()}, 3200);
                        break;
                    case "MATCH_OVER":
                        // Match is completely finished
                        // console.log("Match Over!");
                        this._renderUI.updateMatchScores("player1", this.mypayload.score[0], this.mypayload.round);
                        this._renderUI.updateMatchScores("player2", this.mypayload.score[1], this.mypayload.round);
                        //build a UI to show the final winner and scores
                        const match_over_board = this._renderUI.createScoreBoard(
                        "match_over_board", null,
                        new Vector3(
                        COURT_DEPTH /2 - 200,
                        150,
                        COURT_DEPTH / 2
                        ),
                        {width: 600, height: 600}
                        );
                        const winnerText = (this.mypayload.matchWinner === 1) ? Myid + " wins the match!" : Opponent + " wins the match!";
                        this._renderUI.update_text(match_over_board.texture, winnerText, 40);
                        //add animation
                        const matchFrameRate = 60;

                        const matchYSlide = new Animation("matchYSlide", "position.y", matchFrameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
                        
                        const matchKeyFrames = [];
                        matchKeyFrames.push({
                            frame: 0,
                            value: 150
                        });
                        matchKeyFrames.push({
                            frame: matchFrameRate * 2,
                            value: 300
                        });
                        matchYSlide.setKeys(matchKeyFrames);
                        match_over_board.plane.animations.push(matchYSlide);
                        this._scene.beginAnimation(match_over_board.plane, 0, matchFrameRate * 2, false);
                        setTimeout(()=> {match_over_board.texture.dispose();
                                        match_over_board.plane.dispose();
                        }, 5000);
                        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for animation to finish before proceeding
                        window.location.href = "/home"; // Redirect to lobby or another page after match over
                        this._state = State.GAME_OVER;
                        break;
                    case "GAME_OVER":
                        this._state = State.GAME_OVER;
                        break;
                        
                }
            }
            if(!this.cameraAnimationFinished && this._camera){
                let previousPosition = this._camera.position.clone();
                const threshold = 0.001;
            }
            switch(this._state){
                // case State.START:
                //     this._scene.render();
                //     break;
                case State.GAME:
                    this._scene.render();
                    break;
                case State.WIN:
                    this._scene.render();
                    break;
                case State.LOSE:
                    this._scene.render();
                    break;
                case State.GAME_OVER:
                    this._scene.render();
                    break;
                default:
                    break;
            }
            this.PowUpsRender.update(PwrState);
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
                    Paddle1.position = new Vector3(Player1.y + Player1.height / 2, 0,Player1.x );
                    Paddle2.position = new Vector3(Player2.y + Player2.height / 2, 0,Player2.x );
                    if(Player1.height)
                        Paddle1.scaling.x = Player1.height / Paddle_w;
                    if(Player2.height)
                        Paddle2.scaling.x = Player2.height / Paddle_w;
                    // Fix ball coordinates - X and Y were swapped
                    Ball.position = new Vector3(ball.y, 12.5, ball.x);
                    //update the score board
                    if(score && (this.score_updates[0] !== score[0] || this.score_updates[1] !== score[1])){
                        this.AudioManager.play("goal");
                        this.score_updates[0] = score[0];
                        this.score_updates[1] = score[1];
                        update_digit(scoreP1.texture, score[0], 120);
                        update_digit(scoreP2.texture, score[1], 120);
                    }
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
        this._init_material(scene);
        this.AudioManager = new AudioManager(scene);
        this._renderUI = new renderUI(scene);
        await this.AudioManager.init_engine();
        // scene.debugLayer.show({
        // initialTab: 2, // Start on a specific tab (e.g., 0 for Scene Explorer, 1 for Inspector, 2 for Debug)

        //     });
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
        // light.diffuse = Color3.FromHexString("#e0382f");
        // const ground: GroundMesh = MeshBuilder.CreateGround("ground", {height: 4500, width: 2550, subdivisions: 4});
        // const axes = new AxesViewer(scene, 2);
        //1107 × 554 
        const WALL_HEIGHT : number = 1;
        const WALL_THICKNESS : number = 0.2;
        const texture_floor : Texture = new Texture("sprites/table_ping.jpeg", scene);
        texture_floor.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);

        
        //Court object
        const floor = MeshBuilder.CreateBox("poolFloor", { width: COURT_WIDTH, height: 0.4, depth: COURT_DEPTH }, scene);
        floor.position = new Vector3(COURT_WIDTH / 2, 0, COURT_DEPTH/2);
        //Paddles
        const Paddle1 = MeshBuilder.CreateBox("paddle1", { width: Paddle_w, height: 50, depth: Paddle_h }, scene);
        // Paddle1.position = new Vector3(1,0,-COURT_DEPTH/2 + 40);
        Paddle1.position = new Vector3(Player1.y ,0,Player1.x + COURT_DEPTH/2);
        // Paddle1.scaling.x = 1;
        const Paddle2 = MeshBuilder.CreateBox("paddle2", { width: Paddle_w, height: 50, depth: Paddle_h }, scene);
        // Paddle2.position = new Vector3(1,0,COURT_DEPTH/2 - 40);
        Paddle2.position = new Vector3(Player2.y,0, Player2.x + COURT_DEPTH/2);
        // Paddle2.scaling.x = 1;
        // this._renderUI.createPlayerIndicator(scene, (front_side === 0) ? Paddle1 : Paddle2); 
        // console.log("MY SIDE " + front_side);
        //BALL
        const Ball = MeshBuilder.CreateSphere("ball_mesh" , {diameter: 25}, scene);
  
        Ball.position = new Vector3(ball.y, ball.radius * 2, ball.x);

        const floorMat: StandardMaterial = new StandardMaterial("floorMat", scene);
        floorMat.emissiveTexture = texture_floor;
        floor.material = floorMat;

        //create powerups renderer
        this.PowUpsRender = new PowUpsRender(scene, floor, this);

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
        const ctx = texture.getContext() as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, 512, 256);

        // const link = document.createElement('link');
        // link.rel = 'stylesheet';
        // link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
        // document.head.appendChild(link);
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
        this._meshes.push(Paddle1);
        this._meshes.push(Paddle2);
        this._meshes.push(Ball); // Push the actual BabylonJS mesh, not the imported ball object
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
            // console.log("Model loaded successfully!");
        } catch (error) {
            console.error("Error loading mesh:", error);
        }
        camera.lockedTarget = floor; //version 2.5 onwards

        //shader 
        Effect.ShadersStore["crtFragmentShader"] = `
        #ifdef GL_ES
            precision highp float;
        #endif

        // Samplers
        varying vec2 vUV;
        uniform sampler2D textureSampler;

        // Parameters
        uniform vec2 curvature;

        vec2 curveRemapUV(vec2 uv)
        {
            // as we near the edge of our screen apply greater distortion using a sinusoid.

            uv = uv * 2.0 - 1.0;
            vec2 offset = abs(uv.yx) / vec2(curvature.x, curvature.y);
            uv = uv + uv * offset * offset;
            uv = uv * 0.5 + 0.5;
            return uv;
        }

        void main(void) 
        {
            vec2 remappedUV = curveRemapUV(vec2(vUV.x, vUV.y));
            vec4 baseColor = texture2D(textureSampler, remappedUV);

            if (remappedUV.x < 0.0 || remappedUV.y < 0.0 || remappedUV.x > 1.0 || remappedUV.y > 1.0){
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            } else {
                gl_FragColor = baseColor;
            }
            
        }
        `;
        var postProcess = new PostProcess("CRTShaderPostProcess", "crt", ["curvature"], null, 1, camera);
        postProcess.onApply = function (effect) {
            effect.setFloat2("curvature", 3.0, 3.0);
        };
        const pipeline = new DefaultRenderingPipeline("default", true, scene, [camera]);
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 4; // Distorts RGB channels
        pipeline.grainEnabled = true;
        pipeline.grain.intensity = 12; // Adds that static/fuzz
        await scene.whenReadyAsync();
        this._scene.dispose();
        this._scene = scene;
        this._state = State.GAME;
        let flag_animation : boolean = false;
        this._scene.onBeforeRenderObservable.add(() => {
        const heightdelta = 1000 - camera.position.y ;

        // show you inside floor
        const createAnnouce = (name: string, parent:Mesh,position: Vector3, size: object) => {
            const plane = MeshBuilder.CreatePlane(name, size, scene);
            if(position){
                plane.position.x = position.x;
                plane.position.y = position.y;
                plane.position.z = position.z;

            }

            else if(parent)
                plane.parent = parent;
            // plane.rotation =  new Vector3(0, Math.PI / 2 + Math.PI, 0);

            const texture = new DynamicTexture(
            name + "Texture",
            { width: 512, height: 256 },
            scene,
            false);
            texture.hasAlpha = true;
            texture.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
            const material = new StandardMaterial(name + "Mat", scene);
            material.diffuseTexture = texture;
            material.emissiveColor = Color3.White();
            material.disableLighting = true;
            material.backFaceCulling = false;

            plane.material = material;
            return { plane, texture };

        };
        // const test = createAnnouce("Hello", floor, null, {width: 340, height: 200});
        // console.log(heightdelta);
        // const test = this._renderUI.createScoreBoard("test", null, null, {width: 100, height: 160});
        // const test = createScoreBoard("test",
        // new Vector3(0, 150, COURT_DEPTH / 4),
        // {width: 400, height: 160}
        // );
        // this._renderUI.update_text(test.texture, "Hello world", 20);
        if(heightdelta <= 100 && !flag_animation)
        {
            flag_animation = true;
            this._renderUI.createHUD("player1", null);

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
            var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

            // Create a button
            var button = GUI.Button.CreateSimpleButton("powerBtn", "Quit game")
            button.height = "60px";
            button.color = "white";
            button.width = "200px";
            button.height = "50px";
            button.cornerRadius = 20; // Makes it a perfect circle
            button.background = "#d32f2f"; // Professional "Power Red"
            button.thickness = 2;
            button.fontSize = 30;
            button.fontFamily = "Press Start 2P";          // Set font family
            button.fontWeight = "bold";           // Set font weight (e.g., "bold", "italic")
            button.fontStyle = "italic";          // Optional: Set font style
            button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            // ---------------------------
            button.onPointerEnterObservable.add(function() {
                button.background = "#ff1744"; // Brighter red
            });
            button.onPointerOutObservable.add(function() {
                button.background = "#d32f2f"; // Back to original
            });
            // Add action to the button
            button.onPointerUpObservable.add(function() {
                window.location.href = "https://localhost/home"; 
            });

            advancedTexture.addControl(button);
            // update_digit(countdown.texture, 1, 100);
        }
        if(heightdelta < 1 && this.cameraAnimationFinished == false)
        {
            // console.log('position delta ' + heightdelta );
            this.AudioManager.play("fifa");
            broadcast({type: 'REQUEST_GAME_STATE'});
            this.cameraAnimationFinished = true;
        }
    });

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