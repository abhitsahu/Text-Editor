import React from "react";
import { createPluginFactory } from "@udecode/plate";

// Custom plugin to support comments
export const createCommentPlugin = () => {
  return createPluginFactory({
    key: "comment",
    isLeaf: true,
    renderLeaf: ({ children, leaf, attributes }) => {
      if (leaf.comment) {
        return (
          <span
            {...attributes}
            style={{
              backgroundColor: "#ffffa1",
              position: "relative",
              cursor: "pointer",
            }}
            title={leaf.comment}
          >
            {children}
          </span>
        );
      }
      return <span {...attributes}>{children}</span>;
    },
  })();
};
