import kind from "@enact/core/kind";
import Button from "@enact/sandstone/Button";
import { Header, Panel } from "@enact/sandstone/Panels";
import { InputField } from "@enact/sandstone/Input";
import { useState } from "react";
import PropTypes from "prop-types";

import css from "./RegisterPanel.module.less";

const InputCarNum = () => {
  let [text, setText] = useState("");

  const onChange = (ev) => {
    setText(ev.value);
  };

  const onSubmit = () => {
    if (text) {
      console.log(text);
      setText("");
    }
  };
  return (
    <>
      <span className={css.inputField}>
        <InputField
          type="text"
          placeholder="Enter the car number"
          onChange={onChange}
          value={text}
        />
      </span>
      <span className={css.submitBtn}>
        <Button type="submit" onClick={onSubmit}>
          submit
        </Button>
      </span>
    </>
  );
};

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

  render: ({ title, text, ...rest }) => {
    delete rest.next;
    return (
      <Panel {...rest}>
        <Header title={title} />
        <InputCarNum />
      </Panel>
    );
  },
});

export default MainPanel;
