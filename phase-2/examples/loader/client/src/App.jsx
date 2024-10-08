import React from "react";
import "./App.css";
import "./Loader.css";
import { useState } from "react";
import { useEffect } from "react";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Эмулируем ожидание данных
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  });

  return (
    <>
      {loading ? (
        <div className="loader"></div>
      ) : (
        <div className="content">Данные загружены</div>
      )}
    </>
  );
}

export default App;
