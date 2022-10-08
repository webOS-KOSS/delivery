import { Header, Panel } from "@enact/sandstone/Panels";
import Scroller from "@enact/ui/Scroller";
import Button from "@enact/sandstone/Button";
import Logs from "./Logs";
import LS2Request from "@enact/webos/LS2Request";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const LogPanel = ({ onClick }) => {
  const [logs, setLogs] = useState(["도착/수령 시간 | 도착/수령"]);
  const bridge = new LS2Request();

  async function start() {
    await init();
    loop();
  }

  useEffect(() => {
    start();
  }, []);

  const init = () => {
    return new Promise((resolve, reject) => {
      let params = {};
      let lsRequest = {
        service: "luna://com.delivery.app.service",
        method: "init",
        parameters: params,
        onSuccess: (msg) => {
          findHandler(msg);
          resolve();
          console.log(msg);
        },
        onFailure: (err) => {
          console.log(err);
          reject();
        },
      };
      bridge.send(lsRequest);
    });
  };

  const findHandler = (res) => {
    let lst = [];
    const results = res.results;
    for (let i in results) {
      let text = `${String(results[i].time).replace(".mp4", "")} | `;
      if (results[i].status === "arrived") {
        text += "도착";
      }
      if (results[i].status == "received") {
        text += "수령";
      }
      lst.unshift(text);
    }
    setLogs(lst);
    console.log(lst);
  };

  const loop = () => {
    let params = { subscribe: true };
    let lsRequest = {
      service: "luna://com.delivery.app.service",
      method: "loop",
      parameters: params,
      onSuccess: (msg) => {
        console.log(msg);
        findHandler(msg);
      },
      onFailure: (err) => {
        console.log(err);
      },
    };
    bridge.send(lsRequest);
  };

  return (
    <Panel>
      <Header title="log app" />
      <Button onClick={init}>init</Button>
      <Button onClick={onClick}>video</Button>
      <Scroller>
        <Logs>{logs}</Logs>
      </Scroller>
    </Panel>
  );
};

LogPanel.propTypes = {
  onClick: PropTypes.func,
};

export default LogPanel;
