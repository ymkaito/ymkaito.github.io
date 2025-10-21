const signalingUrl = "wss://ayame-labo.shiguredo.app/signaling";

// パラメーターのパース
const params = window.location.search;
const searchParams = new URLSearchParams(params);
if (!searchParams.has("roomId") || !searchParams.has("signalingKey")) {
  alert("roomIdとsignalingKeyをクエリにセットしてください．");
}
const roomId = searchParams.get("roomId");
const signalingKey = searchParams.get("signalingKey");
console.log("roomId: ", roomId, ", signalingKey: ", signalingKey);

// Ayame
let dataChannel = null;
const conn = Ayame.connection(signalingUrl, roomId);
conn.options.video.direction = "recvonly";
conn.options.audio.direction = "recvonly";
conn.options.video.codec = "VP9"; //デスクトップChrome系のブラウザでのみ反映される
conn.options.signalingKey = signalingKey;
const startConn = async () => {
  conn.on("open", async (e) => {
    dataChannel = await conn.createDataChannel("dataChannel");
    dataChannel.onmessage = (e) => {
      console.log("data received: ", e.data);
    };
  });
  await conn.connect(null);
  conn.on("disconnect", (e) => console.log(e));
  conn.on("addstream", (e) => {
    document.querySelector("#remote-video").srcObject = e.stream;
  });
};
function sendData(data) {
  dataChannel.send(data);
}

// ボタン
document.querySelector("#connect").onclick = startConn;
document.querySelector("#disconnect").onclick = () => {
  conn.disconnect();
};
document.querySelector("#send0").onclick = () => {
  sendData("0");
  console.log("send 0");
};
document.querySelector("#send1").onclick = () => {
  sendData("1");
  console.log("send 1");
};

// 移動コマンド
function goStraight() {
  sendData("w");
  sendData("w");
  sendData("w");
  sendData("w");
  sendData("w");
  console.log("send w");
}
function goBack() {
  sendData("s");
  sendData("s");
  sendData("s");
  sendData("s");
  sendData("s");
  console.log("send s");
}
function turnRight() {
  sendData("a");
  sendData("a");
  sendData("a");
  sendData("a");
  sendData("a");
  console.log("send d");
}
function turnLeft() {
  sendData("d");
  sendData("d");
  sendData("d");
  sendData("d");
  sendData("d");
  console.log("send a");
}
function stopMoving() {
  sendData("e");
  sendData("e");
  sendData("e");
  sendData("e");
  sendData("e");
  console.log("send e");
}

// キー長押し時の連続入力を抑制する

let prevus_down_key_code = null;
function throttle_back_key_down(code, func) {
  if (prevus_down_key_code != code) {
    prevus_down_key_code = code;
    func();
  }
}
function throttle_back_key_up(code, func) {
  if (prevus_down_key_code === code) {
    prevus_down_key_code = null;
  }
  func();
}

window.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "KeyW":
      throttle_back_key_down("KeyW", goStraight);
      break;
    case "KeyS":
      throttle_back_key_down("KeyS", goBack);
      break;
    case "KeyD":
      throttle_back_key_down("KeyD", turnRight);
      break;
    case "KeyA":
      throttle_back_key_down("KeyA", turnLeft);
      break;
    default:
      break;
  }
});
window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "KeyW":
      throttle_back_key_up("KeyW", stopMoving);
      break;
    case "KeyS":
      throttle_back_key_up("KeyS", stopMoving);
      break;
    case "KeyD":
      throttle_back_key_up("KeyD", stopMoving);
      break;
    case "KeyA":
      throttle_back_key_up("KeyA", stopMoving);
      break;
    default:
      break;
  }
});
