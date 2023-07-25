

// classList.removeの時の確認


import './style.css'
import * as THREE from "three" 

//①canvas
const canvas = document.querySelector("#webgl");

//②シーン
const scene =  new THREE.Scene();


//③背景のテクスチャ(シーン以降に記述)
const textureLoader = new THREE.TextureLoader();
// const bdTexture = textureLoader.load("bg/bg.JPG");
// scene.background = bdTexture;

//④サイズ(アスペクト比)
const sizes = {
    width: innerWidth,
    height: innerHeight,
};

//⑤カメラ
const camera  = new THREE.PerspectiveCamera(
    //引数4つ (視野角、アスペクト比(幅、高さ)、ニアー、ファー)
    75,
    sizes.width / sizes.height,
    0.1,
    1000
);

//⑥レンダラー(webglrendererはcanvasの中に描画していく)
const renderer = new THREE.WebGLRenderer({
    canvas: canvas, //canvasのオブジェクトをcanvasという引数にぶち込む
    alpha: true
});
renderer.setSize(sizes.width, sizes.height); //レンダラーのサイズ指定(ブラウザの画面いっぱい)
renderer.setPixelRatio(window.devicePixelRatio);    //webglで備え付けられてる関数→モデルのpixelの最適化

//------canvas、シーン、サイズ、カメラ、レンダラーが基本的なひな形-----------------------------


//⑦オブジェクトの作成(作成したモデルを使うにはgltfモジュールをつかう)
const boxGeometry = new THREE.BoxGeometry(5,5,5,10);    //box(正方形)型の追加
const boxMaterial = new THREE.MeshNormalMaterial();
const box = new THREE.Mesh(boxGeometry,boxMaterial);
box.position.set(0,0.5,-15);    //boxの座標をマイナス方向に持っていく
box.rotation.set(1,1,0);    //角度
//座標の指定をしていないとboxとカメラの座標位置がかぶっているからオブジェクトが見えない→(webglにおけるｘ、ｙ、ｚ座標のつかみが必要)

const torusGeometry = new THREE.TorusGeometry(8, 2, 16, 100);   //ドーナツ型の追加
const torusMaterial = new THREE.MeshNormalMaterial();
const torus = new THREE.Mesh(torusGeometry,torusMaterial);
torus.position.set(0, 1, 10);

scene.add(box,torus);   


//⑧線形補間で滑らかに移動させる  線形補間には公式がありまーす→動画114
//------------------------------------------ここ大事------------------------------------------------------------------
function lerp(x,y,a) {          //移動の滑らかさが一次関数的に変化するもの、二次関数的に変更するものも作れる(今回は一次関数)
    return (1 - a) * x + a * y;
}

//⑨aの値の関数
function scalePercent(start,end){       //scalePercentがaに相当する。a→スクロール率に応じて各区間(start(0)～end(40)のどの位置に存在しているのか割合を取得する)
    return (scrollPercent - start) / (end - start);
}

const section = document.getElementById("section");

//⑩スクロールアニメーション
const animationScripts = [];    //アニメーションの制御について動画110を見ればわかる


//z軸移動の制御
animationScripts.push({
    start: 50,
    end: 70,
    function() {
        camera.lookAt(box.position);
        camera.position.set(0, 1, 10);  //→z方向の手前位置に動かしておく

        //box.position.z += 0.1;     //線形補間をしてオブジェジュの操作をしていないからスクロール反応ではなく単調に動いているだけになる
        box.position.z = lerp(-15,0,scalePercent(50,70)); //lerp(x→始まる座標(position.setで-15にしてるから)、 y→終わる座標、 a→固定値だと物体間の移動ができないから関数を渡してあげる)
        torus.position.z = lerp(10,-30,scalePercent(50,70)); //scalePercent(引数)を渡して⑨のscalePercentのstartとendに当ててる


    },
})
//基本的にanimationScript.pushでスクロール制御ができる

//回転の制御
animationScripts.push({
    start: 70,  //ここの値が配列に入れてるanimationScriptsの動く期間の指定
    end: 80,
    function() {
        camera.lookAt(box.position);
        camera.position.set(0, 1, 10);  //→z方向の手前位置に動かしておく
        //回転の処理　ここも角度の初期値を⑦で指定しているので注意
        box.rotation.z = lerp(1, Math.PI,scalePercent(70,80));   //lerp(回転始まる位置, どこまで回転させるのか,移動位置の座標) *Math.PI→半回転させる
    },
})

//カメラの移動
animationScripts.push({
    start: 80,  //ここの値が配列に入れてるanimationScriptsの動く期間の指定
    end: 90,
    //camera.position.set(0, 1, 10);カメラの存在座標(ｘ、ｙ、ｚ)
    function() {
        camera.lookAt(box.position);
        camera.position.x = lerp(0, -15, scalePercent(80, 90));
        camera.position.y = lerp(1, 15, scalePercent(80, 90));
        camera.position.z = lerp(10, 25, scalePercent(80, 90));
    },
})

animationScripts.push({
    start: 90,  //ここの値が配列に入れてるanimationScriptsの動く期間の指定
    end: 100,
    //camera.position.set(0, 1, 10);カメラの存在座標(ｘ、ｙ、ｚ)
    function() {
        camera.lookAt(box.position);
        //x,yに常に回転をかけ続ける
        box.rotation.x += 0.02;
        box.rotation.y += 0.02;
    },
})


//↑ここまでだとanimationScriptという配列にアニメーションを追加しただけで実行できてない

//⑪アニメーションを開始
function playScrollAnimation() {
    animationScripts.forEach((animation) => {   //forEachで配列の中身をanimationとして取り出す
    
    //PlayScrollAnimationは自動的に実行されるものなのでどこからどこまでboxを動かすのか、スクロール率に応じてboxの制御をしないといけない(スクロール率の取得へ)
    //animation.function();だけではスクロールに対応したオブジェクトの操作は出来ない
                                                
    if(scrollPercent>= animation.start && scrollPercent <= animation.end)
        animation.function();

    });      
    
}   //playScrollAnimationをtickのなかに入れればOK



//⑫ブラウザのスクロール率を取得→動画112  (x/y-l) * 100
//-----------------------------ここ応用きかせやすいかも-----------------------------

let scrollPercent = 0; //変数の用意→スクロール率の取得

let scrollPercent2 = 0;

document.body.onscroll = () => {
    scrollPercent = 
        (document.documentElement.scrollTop / 
           (document.documentElement.scrollHeight - 
                document.documentElement.clientHeight)) * 
        100;


        console.log(scrollPercent);
    }


//⑬アニメーション
const tick = () => {        //アロー関数（定数/変数名 =（引数）=> {処理}; 　定数/変数名 = function() {処理};と一緒
    window.requestAnimationFrame(tick);     //tickを何回もフレーム単位で呼び出す
    playScrollAnimation();
    renderer.render(scene, camera);

    //マウスの角度に応じて角度設定
};

tick();

//⑭ブラウザのリサイズ操作(サイト、カメラのアスペクト比、レンダラーのリサイズ)
window.addEventListener("resize", () =>{        //addEventListener　マウスによるクリック、キーボードからの入力といった様々なイベント処理を実行するメソッド　
    //サイトのリサイズ
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //カメラのアスペクト比のリサイズ
    camera.aspect = sizes.width /sizes.height;
    //アスペクト比を変えると下の関数(updateProjectionMatrix)を呼ぶ
    camera.updateProjectionMatrix();

    //レンダラーのリサイズ
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);

})




//loading画面の作成


//下のコードの効率化
function loaded() {
    document.getElementById("loading").classList.add("active");
}

setTimeout(loaded, 5000)




// window.addEventListener("load", function() {            //loadで指定することで画面の要素全てを読み込んだ後にaddeventlisnnerを起動させる
//     setTimeout(function(){
//         document.getElementById("loading").classList.remove("active");
//     },5000)  //500→0.5秒
//     //クッソ重いサイトの読み込みとかだとloadingが一生終わらんとかある
// })

// //addeventlisnnerの処理待ちをなくしたsettimeoutを準備しておく
// setTimeout(function(){
//     document.getElementById("loading").classList.remove("active");
// },100000)
