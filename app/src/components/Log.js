import kind from "@enact/core/kind";
import Proptypes from "prop-types";
import Button from "@enact/sandstone/Button";

import css from "./Log.module.less";

const RemoveBtn = () => {
  const remove = () => {
    console.log("remove");
  };

  return (
    <span>
      <Button onClick={remove}>remove</Button>
    </span>
  );
};

const LogBase = kind({
  name: "LogBase",

  styles: {
    css,
    className: "log-box",
  },

  propTypes: {
    children: Proptypes.string,
    index: Proptypes.number,
  },

  render: ({ children, ...rest }) => {
    delete rest.index;

    return (
      <div {...rest}>
        <div className={css.log}>
          <span>{children}</span>
          <RemoveBtn />
        </div>
      </div>
    );
  },
});

const Log = LogBase;

export default LogBase;
export { Log, LogBase };
