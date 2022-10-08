const pkgInfo = require("./package.json");
const Service = require("webos-service");
const luna = require("./luna_service");
const request = require("request");
const mosquitto = require("mqtt");
const mqtt = require("./mqtt_lib");
const service = new Service(pkgInfo.name); // Create service by service name on package.json
const logHeader = "[" + pkgInfo.name + "]";

const kindID = "com.log.db:2";

const ip = "3.34.50.139";
// mosquitto_pub -h 3.34.50.139 -t "car" -m "{\"time\":\"123\", \"carNumber\":\"123\", \"status\":\"registered\"}"

const putKind = (msg) => {
  service.call(
    "luna://com.webos.service.db/putKind",
    {
      id: kindID,
      owner: pkgInfo.name,
      indexes: [
        { name: "time", props: [{ name: "time" }] },
        { name: "status", props: [{ name: "status" }] },
      ],
    },
    (res) => {
      console.log(logHeader, res.payload);
      console.log("putKind");
      putPermissions(msg);
    }
  );
};

const putPermissions = (msg) => {
  service.call(
    "luna://com.webos.service.db/putPermissions",
    {
      permissions: [
        {
          operations: {
            read: "allow",
            create: "allow",
            update: "allow",
            delete: "allow",
          },
          object: kindID,
          type: "db.kind",
          caller: pkgInfo.name,
        },
      ],
    },
    (res) => {
      console.log(logHeader, res.payload);
      console.log("putPermissions");
      find(msg);
    }
  );
};

const put = (res, msg) => {
  service.call(
    "luna://com.webos.service.db/put",
    {
      objects: [
        {
          _kind: kindID,
          time: res.time,
          status: res.status,
        },
      ],
    },
    (res) => {
      console.log(res);
      console.log("put");
      find(msg);
    }
  );
};

const find = (msg) => {
  service.call(
    "luna://com.webos.service.db/find",
    {
      query: {
        from: kindID,
      },
    },
    (res) => {
      let results = res.payload.results;
      console.log(results);
      console.log("find");
      msg.respond({ returnValue: true, results: results });
    }
  );
};

service.register("init", (msg) => {
  putKind(msg);
});

service.register("loop", (msg) => {
  luna.init(service);

  mqtt.init(mosquitto);
  client = mqtt.connect(ip);
  mqtt.subscribe(["delivery/arrived"]);
  luna.toast("서비스 시작!");
  luna.tts("서비스 시작!");

  client.on("message", (topic, message, packet) => {
    console.log("[message] : " + message);
    console.log("[topic] : " + topic);
    if (topic == "delivery/arrived") {
      // ESP8266으로부터 차량이 도착한 정보를 받으면 사진을 찍어 tesseract에 넘긴다.
      luna.tts("택배가 도착했습니다.");
      luna.toast("택배가 도착했습니다.");
    }
    if (topic == "delivery/recieved") {
      luna.tts("택배가 현관에서 사라졌습니다.");
      luna.toast("택배를 수령하셨습니까?");
    }
    let messageParse = String(message);
    let jsonMsg = JSON.parse(messageParse);
    console.log(jsonMsg);
    put(jsonMsg, msg);
    // if (topic == "car/analyze") { // tesseract로부터 데이터를 받아온 후 DB8에 put --> 그리고 데이터 파싱하는 과정에 분석하여 결과가 등록된 차량이었다면 tts로 알려주면 좋을듯
    //   let messageParse = String(message);
    //   let jsonMsg = JSON.parse(messageParse);
    // }
    msg.respond({ returnValue: true, time: message, status: "arrived" });
  });

  //------------------------- heartbeat 구독 -------------------------
  const sub = service.subscribe(`luna://${pkgInfo.name}/heartbeat`, {
    subscribe: true,
  });
  const max = 10000; //heart beat 횟수 /// heart beat가 꺼지면, 5초 정도 딜레이 생김 --> 따라서 이 녀석도 heart beat를 무한히 돌릴 필요가 있어보임.
  let count = 0;
  sub.addListener("response", function (msg) {
    console.log(JSON.stringify(msg.payload));
    if (++count >= max) {
      sub.cancel();
      setTimeout(function () {
        console.log(max + " responses received, exiting...");
        process.exit(0);
      }, 1000);
    }
  });

  //------------------------- heartbeat 구독 -------------------------
});

//----------------------------------------------------------------------heartbeat----------------------------------------------------------------------
// handle subscription requests
const subscriptions = {};
let heartbeatinterval;
let x = 1;
function createHeartBeatInterval() {
  if (heartbeatinterval) {
    return;
  }
  console.log(logHeader, "create_heartbeatinterval");
  heartbeatinterval = setInterval(function () {
    sendResponses();
  }, 1000);
}

// send responses to each subscribed client
function sendResponses() {
  console.log(logHeader, "send_response");
  console.log(
    "Sending responses, subscription count=" + Object.keys(subscriptions).length
  );
  for (const i in subscriptions) {
    if (Object.prototype.hasOwnProperty.call(subscriptions, i)) {
      const s = subscriptions[i];
      s.respond({
        returnValue: true,
        event: "beat " + x,
      });
    }
  }
  x++;
}

var heartbeat = service.register("heartbeat");
heartbeat.on("request", function (message) {
  console.log(logHeader, "SERVICE_METHOD_CALLED:/heartbeat");
  message.respond({ event: "beat" }); // initial response
  if (message.isSubscription) {
    subscriptions[message.uniqueToken] = message; //add message to "subscriptions"
    if (!heartbeatinterval) {
      createHeartBeatInterval();
    }
  }
});
heartbeat.on("cancel", function (message) {
  delete subscriptions[message.uniqueToken]; // remove message from "subscriptions"
  var keys = Object.keys(subscriptions);
  if (keys.length === 0) {
    // count the remaining subscriptions
    console.log("no more subscriptions, canceling interval");
    clearInterval(heartbeatinterval);
    heartbeatinterval = undefined;
  }
});

service.register("getVids", (msg) => {
  const options = {
    uri: "http://192.168.1.9:3000/vidlist",
    headers: { app: "package" },
  };

  request.get(options, (err, res, body) => {
    if (err) {
      console.log(err);
    }
    let vidlist = JSON.parse(body).vidlist;
    console.log(logHeader + vidlist);
    msg.respond({ returnValue: true, vidlist: vidlist });
  });
});
