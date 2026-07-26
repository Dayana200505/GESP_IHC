import React from "react";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="card editor-card">
        <h2>Editor de código</h2>

        <pre className="code-area">
1  filter even [1..10]
2
3
4
5
6
7
8
9
10
11
12
        </pre>

        <div className="editor-actions">
          <button className="primary-btn">Explicar función</button>
        </div>
      </div>

      <div className="card explanation-card">
        <h2>Explicación guiada</h2>
        <div className="explanation-body"></div>
      </div>
    </div>
  );
}

export default Home;
