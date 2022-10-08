import { Header, Panel } from "@enact/sandstone/Panels";
import Scroller from "@enact/ui/Scroller";
import Button from "@enact/sandstone/Button";
import Proptype from "prop-types";
import LS2Request from "@enact/webos/LS2Request";
import { useEffect, useState } from "react";

import Tiles from "./Tiles";

const VideoList = ({ onSelectVid, onClick, ...rest }) => {
  const [tiles, setTiles] = useState(["loading"]);

  const bridge = new LS2Request();
  const getVids = () => {
    let params = {};
    let lsRequest = {
      service: "luna://com.delivery.app.service",
      method: "getVids",
      parameter: params,
      onSuccess: (msg) => {
        console.log(msg);
        setTiles(msg.vidlist);
      },
      onFailure: (err) => {
        console.log(err);
      },
    };
    bridge.send(lsRequest);
  };

  useEffect(() => {
    getVids();
  }, []);

  return (
    <Panel {...rest}>
      <Header title="Videos" />
      <Button onClick={onClick}>log</Button>
      <Scroller>
        <Tiles onSelectVid={onSelectVid}>{tiles}</Tiles>
      </Scroller>
    </Panel>
  );
};

VideoList.prototype = {
  onSelectVid: Proptype.func,
  onClick: Proptype.func,
};

export default VideoList;
