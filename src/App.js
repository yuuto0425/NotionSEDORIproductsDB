import React, { useState, useRef } from "react";
import copy from "clipboard-copy"; // clipboard-copy ライブラリをインポート
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";
import "./App.css"; // CSSをインポート
import axios from "axios";

function WebForm() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const getProductValue = () => {
    const product = queryParams.get("product");
    return product ? decodeURIComponent(product).replace(/"/g, "") : "";
  };

  const getASINValue = () => {
    const asin = queryParams.get("asin");
    return asin ? decodeURIComponent(asin).replace(/"/g, "") : "";
  };

  const textAreaRef = useRef(null);

  const handleCopyToClipboard = async () => {
    try {
      const textToCopy = textAreaRef.current.value;
      await copy(textToCopy);
      alert("テキストがクリップボードにコピーされました");
    } catch (error) {
      alert("クリップボードへのコピーに失敗しました");
    }
  };

  const [product, setProduct] = useState(getProductValue());
  const [asin, setASIN] = useState(getASINValue());

  const [feedback, setFeedback] = useState(""); // 感想をクエリパラメーターから取得しない

  const [feedText, setFeedText] = useState("");

  // let response;
  const handleFormSubmit = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/createNotionPage`|| `https://notion-products-db-server-app-bee944b6684d.herokuapp.com/createNotionPage`,
        {
          product,
          asin,
          feedback,
        }
      );
      // const {properties} = [response.data];
      console.log(
        "Response from server:",
        response.data,
        response.data.data.properties.質問内容テキスト.formula.string
      );
      setFeedText(
        response.data.data.properties.質問内容テキスト.formula.string
      );
    } catch (error) {
      console.error(
        "Error from server:",
        error.response?.data || error.message
      );
    }
  };

  // const FeedText = response.data.data.properties

  return (
    <div className="form-container">
      <h2>Web Form</h2>
      <form>
        <div className="form-input">
          <label>商品名</label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label>ASIN</label>
          <input
            type="text"
            value={asin}
            onChange={(e) => setASIN(e.target.value)}
          />
        </div>

        <div className="form-input">
          <label>感想</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
      </form>
      <div className="form-input">
        <Link to={`/form?product=${product}&asin=${asin}`}>保存</Link>
      </div>
      <div>
        <button type="button" onClick={handleFormSubmit}>
          送信
        </button>
      </div>
      <div>
        <textarea
          ref={textAreaRef}
          defaultValue= {feedText}
        />
        <button onClick={handleCopyToClipboard}>クリップボードにコピー</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/form" element={<WebForm />} />
      </Routes>
    </Router>
  );
}

export default App;
