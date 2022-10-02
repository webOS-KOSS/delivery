import kind from "@enact/core/kind";
import Button from "@enact/sandstone/Button";
import { Header, Panel } from "@enact/sandstone/Panels";
import Scroller from "@enact/ui/Scroller";
import Logs from "./Logs";
import PropTypes from "prop-types";

let logs = ["a", "a", "a", "a", "a", "a", "a"];

const MainPanel = kind({
  name: "MainPanel",

  propTypes: {
    next: PropTypes.string,
    onClick: PropTypes.func,
    title: PropTypes.string,
  },

  computed: {
    text: ({ next }) => `To ${next} Panel`,
  },

  render: ({ title, onClick, ...rest }) => {
    delete rest.next;
    return (
      <Panel {...rest}>
        <Header title={title} />
        <Scroller>
          <Button onClick={onClick}>Register</Button>
          <Logs>{logs}</Logs>
        </Scroller>
      </Panel>
    );
  },
});

export default MainPanel;
