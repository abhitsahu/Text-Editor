import React, { useState } from "react";
import RichTextEditor from "./components/RichTextEditor";
import "./App.css";

function App() {
  const [editorValue, setEditorValue] = useState([]);
  const [formattedText, setFormattedText] = useState("");

  const handleEditorChange = (value) => {
    setEditorValue(value);

    // Convert the editor value to HTML for display
    const displayText = value
      .map((node) => {
        const renderNode = (n) => {
          if (n.text !== undefined) {
            let text = n.text || "";
            if (n.bold) text = `<strong>${text}</strong>`;
            if (n.italic) text = `<em>${text}</em>`;
            if (n.underline) text = `<u>${text}</u>`;
            if (n.code) text = `<code>${text}</code>`;
            if (n.highlight) text = `<mark>${text}</mark>`;
            if (n.comment)
              text = `<span title="${n.comment}" style="background-color:#ffffa1">${text}<sup>📝</sup></span>`;
            return text;
          }

          if (n.children) {
            const childText = n.children.map(renderNode).join("");

            switch (n.type) {
              case "heading-one":
                return `<h1>${childText}</h1>`;
              case "heading-two":
                return `<h2>${childText}</h2>`;
              case "block-quote":
                return `<blockquote>${childText}</blockquote>`;
              case "bulleted-list":
                return `<ul>${childText}</ul>`;
              case "numbered-list":
                return `<ol>${childText}</ol>`;
              case "list-item":
                return `<li>${childText}</li>`;
              default:
                return `<p>${childText}</p>`;
            }
          }

          return "";
        };

        return renderNode(node);
      })
      .join("");

    setFormattedText(displayText);
  };

  return (
    <div className="App">
      <h1>Text Editor</h1>
      <RichTextEditor onChange={handleEditorChange} />
      <div className="preview-section">
        <h2>Formatted Text Preview:</h2>
        <div
          className="formatted-preview"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      </div>
    </div>
  );
}

export default App;
