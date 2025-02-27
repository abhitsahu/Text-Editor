const ToolbarButton = ({ active, icon, onMouseDown }) => {
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
      onMouseDown={onMouseDown}
    >
      {icon}
    </button>
  );
};

export default ToolbarButton;
