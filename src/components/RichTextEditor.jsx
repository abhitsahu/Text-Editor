import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  createEditor,
  Transforms,
  Editor,
  Text,
  Element as SlateElement,
} from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { withHistory } from "slate-history";
import { Bold, Italic, Underline } from "./Formatting";

//default value
const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Hello " }, { text: "World", id: "world-text" }],
  },
];

//custom element types
const ELEMENT_TYPES = {
  PARAGRAPH: "paragraph",
  HEADING_ONE: "heading-one",
  HEADING_TWO: "heading-two",
  BLOCK_QUOTE: "block-quote",
  BULLETED_LIST: "bulleted-list",
  NUMBERED_LIST: "numbered-list",
  LIST_ITEM: "list-item",
};

// Format button component
const FormatButton = ({ format, icon, active, onToggle }) => {
  return (
    <button
      style={{
        backgroundColor: active ? "#eee" : "transparent",
        border: "1px solid #ccc",
        borderRadius: "4px",
        margin: "0 5px",
        padding: "5px 10px",
        cursor: "pointer",
        fontWeight: active ? "bold" : "normal",
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        onToggle(format);
      }}
    >
      {icon}
    </button>
  );
};

// Element button for block-level formatting
const ElementButton = ({ format, icon, active, onToggle }) => {
  return (
    <button
      style={{
        backgroundColor: active ? "#eee" : "transparent",
        border: "1px solid #ccc",
        borderRadius: "4px",
        margin: "0 5px",
        padding: "5px 10px",
        cursor: "pointer",
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        onToggle(format);
      }}
    >
      {icon}
    </button>
  );
};

// Helper to check if mark is active
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Helper to check if block type is active
const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  return !!match;
};

// Helper to toggle mark
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Helper to toggle block type
const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList =
    format === ELEMENT_TYPES.BULLETED_LIST ||
    format === ELEMENT_TYPES.NUMBERED_LIST;

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      [ELEMENT_TYPES.BULLETED_LIST, ELEMENT_TYPES.NUMBERED_LIST].includes(
        n.type
      ),
    split: true,
  });

  const newProperties = {
    type: isActive
      ? ELEMENT_TYPES.PARAGRAPH
      : isList
      ? ELEMENT_TYPES.LIST_ITEM
      : format,
  };

  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

// Toolbar component with mark and block formatting
const Toolbar = () => {
  const editor = useSlate();

  return (
    <div
      style={{
        marginBottom: "10px",
        padding: "5px",
        borderBottom: "1px solid #ccc",
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          marginRight: "10px",
          borderRight: "1px solid #ccc",
          paddingRight: "10px",
        }}
      >
        <FormatButton
          format="bold"
          icon="B"
          active={isMarkActive(editor, "bold")}
          onToggle={() => toggleMark(editor, "bold")}
        />
        <FormatButton
          format="italic"
          icon="I"
          active={isMarkActive(editor, "italic")}
          onToggle={() => toggleMark(editor, "italic")}
        />
        <FormatButton
          format="underline"
          icon="U"
          active={isMarkActive(editor, "underline")}
          onToggle={() => toggleMark(editor, "underline")}
        />
        <FormatButton
          format="code"
          icon="<>"
          active={isMarkActive(editor, "code")}
          onToggle={() => toggleMark(editor, "code")}
        />
        <FormatButton
          format="highlight"
          icon="H"
          active={isMarkActive(editor, "highlight")}
          onToggle={() => toggleMark(editor, "highlight")}
        />
      </div>

      <div>
        <ElementButton
          format={ELEMENT_TYPES.HEADING_ONE}
          icon="H1"
          active={isBlockActive(editor, ELEMENT_TYPES.HEADING_ONE)}
          onToggle={() => toggleBlock(editor, ELEMENT_TYPES.HEADING_ONE)}
        />
        <ElementButton
          format={ELEMENT_TYPES.HEADING_TWO}
          icon="H2"
          active={isBlockActive(editor, ELEMENT_TYPES.HEADING_TWO)}
          onToggle={() => toggleBlock(editor, ELEMENT_TYPES.HEADING_TWO)}
        />
        <ElementButton
          format={ELEMENT_TYPES.BLOCK_QUOTE}
          icon=">"
          active={isBlockActive(editor, ELEMENT_TYPES.BLOCK_QUOTE)}
          onToggle={() => toggleBlock(editor, ELEMENT_TYPES.BLOCK_QUOTE)}
        />
        <ElementButton
          format={ELEMENT_TYPES.BULLETED_LIST}
          icon="•"
          active={isBlockActive(editor, ELEMENT_TYPES.BULLETED_LIST)}
          onToggle={() => toggleBlock(editor, ELEMENT_TYPES.BULLETED_LIST)}
        />
        <ElementButton
          format={ELEMENT_TYPES.NUMBERED_LIST}
          icon="#"
          active={isBlockActive(editor, ELEMENT_TYPES.NUMBERED_LIST)}
          onToggle={() => toggleBlock(editor, ELEMENT_TYPES.NUMBERED_LIST)}
        />
      </div>
    </div>
  );
};

const withComments = (editor) => {
  const { isInline } = editor;

  editor.isInline = (element) => {
    return element.type === "comment" ? true : isInline(element);
  };

  return editor;
};

const RichTextEditor = ({ onChange }) => {
  const [value, setValue] = useState(initialValue);
  const [commentText, setCommentText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Slate editor object with history and comments
  const editor = useMemo(
    () => withComments(withHistory(withReact(createEditor()))),
    []
  );

  // Fetch random text for comment
  useEffect(() => {
    fetch("https://loripsum.net/api/1/short/plaintext")
      .then((response) => response.text())
      .then((data) => {
        setCommentText(data.trim());
      })
      .catch((error) => {
        console.error("Error fetching random text:", error);
        setCommentText(
          "This is a default comment since we could not fetch random text."
        );
      });
  }, []);

  // Add comment to "World" text once comment is loaded
  useEffect(() => {
    if (commentText && value) {
      const newValue = JSON.parse(JSON.stringify(value));

      // Find the node containing "World"
      for (const node of newValue) {
        if (node.children) {
          for (const child of node.children) {
            if (child.text === "World" || child.id === "world-text") {
              // Add comment to this node
              child.comment = commentText.substring(0, 100); // Trim long comments
              setValue(newValue);
              if (onChange) onChange(newValue);
              break;
            }
          }
        }
      }
    }
  }, [commentText]);

  // Calculate word and character count when content changes
  useEffect(() => {
    let text = "";
    let words = 0;

    // Extract all text content
    const getTextFromNode = (node) => {
      if (Text.isText(node)) {
        text += node.text;
        return;
      }

      if (node.children) {
        node.children.forEach((child) => getTextFromNode(child));
      }
    };

    value.forEach((node) => getTextFromNode(node));

    // Count words (split by whitespace and filter empty strings)
    const wordArray = text.split(/\s+/).filter((word) => word.length > 0);
    words = wordArray.length;

    setWordCount(words);
    setCharCount(text.length);
  }, [value]);

  // Handle changes to the editor
  const handleChange = useCallback(
    (newValue) => {
      setValue(newValue);
      if (onChange) onChange(newValue);
    },
    [onChange]
  );

  // Custom rendering for leaf elements (text with formatting)
  const renderLeaf = useCallback((props) => {
    let { attributes, children, leaf } = props;

    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    if (leaf.code) {
      children = (
        <code
          style={{
            backgroundColor: "#f0f0f0",
            padding: "2px 4px",
            borderRadius: "3px",
            fontFamily: "monospace",
          }}
        >
          {children}
        </code>
      );
    }

    if (leaf.highlight) {
      children = <mark style={{ backgroundColor: "#ffff00" }}>{children}</mark>;
    }

    if (leaf.comment) {
      children = (
        <span
          style={{
            backgroundColor: "#ffffa1",
            position: "relative",
            cursor: "pointer",
          }}
          title={leaf.comment}
        >
          {children}
          <sup style={{ fontSize: "8px", color: "#666" }}>📝</sup>
        </span>
      );
    }

    return <span {...attributes}>{children}</span>;
  }, []);

  // Custom rendering for block elements
  const renderElement = useCallback((props) => {
    const { attributes, children, element } = props;

    switch (element.type) {
      case ELEMENT_TYPES.HEADING_ONE:
        return <h1 {...attributes}>{children}</h1>;
      case ELEMENT_TYPES.HEADING_TWO:
        return <h2 {...attributes}>{children}</h2>;
      case ELEMENT_TYPES.BLOCK_QUOTE:
        return (
          <blockquote
            style={{
              borderLeft: "2px solid #ccc",
              paddingLeft: "10px",
              color: "#666",
            }}
            {...attributes}
          >
            {children}
          </blockquote>
        );
      case ELEMENT_TYPES.BULLETED_LIST:
        return <ul {...attributes}>{children}</ul>;
      case ELEMENT_TYPES.NUMBERED_LIST:
        return <ol {...attributes}>{children}</ol>;
      case ELEMENT_TYPES.LIST_ITEM:
        return <li {...attributes}>{children}</li>;
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  // Set up key handlers for formatting shortcuts
  const onKeyDown = useCallback(
    (event) => {
      // Bold: Ctrl+B
      if (event.ctrlKey && event.key === "b") {
        event.preventDefault();
        toggleMark(editor, "bold");
      }

      // Italic: Ctrl+I
      if (event.ctrlKey && event.key === "i") {
        event.preventDefault();
        toggleMark(editor, "italic");
      }

      // Underline: Ctrl+U
      if (event.ctrlKey && event.key === "u") {
        event.preventDefault();
        toggleMark(editor, "underline");
      }

      // Code: Ctrl+`
      if (event.ctrlKey && event.key === "`") {
        event.preventDefault();
        toggleMark(editor, "code");
      }
    },
    [editor]
  );

  return (
    <div className="rich-text-editor">
      <Slate editor={editor} value={value} onChange={handleChange}>
        <Toolbar />
        <Editable
          style={{
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            minHeight: "150px",
            lineHeight: "1.5",
          }}
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          onKeyDown={onKeyDown}
          placeholder="Type something..."
          spellCheck
        />
      </Slate>

      <div
        style={{
          marginTop: "10px",
          fontSize: "0.8rem",
          color: "#666",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          Words: {wordCount} | Characters: {charCount}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
