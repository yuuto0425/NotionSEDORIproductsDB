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

  const getStockPriceValue = () => {
    const StockPriceValue = queryParams.get("stock-price");
    return StockPriceValue
      ? decodeURIComponent(StockPriceValue).replace(/"/g, "")
      : "";
  };

  const textAreaRef = useRef(null);

  const [isCopyButtonClicked, setIsCopyButtonClicked] = useState(false);

  const handleCopyToClipboard = async (e) => {
    e.preventDefault();
    try {
      const textToCopy = textAreaRef.current.value;
      await copy(textToCopy);
      alert("テキストがクリップボードにコピーされました");
      setIsCopyButtonClicked(true); // コピーが成功したら状態を更新
    } catch (error) {
      alert("クリップボードへのコピーに失敗しました");
    }
  };


  //スマホでフォームの拡大を無効化にする
  const touchHandler = (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  };
  document.addEventListener('touchstart', touchHandler, {
    passive: false
  });

  const [product, setProduct] = useState(getProductValue());
  const [asin, setASIN] = useState(getASINValue());
  const [StockPriceValue, setStockPriceValue] = useState(getStockPriceValue());

  const [feedback, setFeedback] = useState(""); // 感想をクエリパラメーターから取得しない

  const [feedText, setFeedText] = useState("");

  const [selectedPurpose, setSelectedPurpose] = useState([]);

  const [checkedItems, setCheckedItems] = useState({
    negotiationEvidence: false,
    trimming: false,
    priceIncreaseNotification: false,
    trendTracking: false,
    procurementDecision: false,
    collection: false,
  });

  // const handleCheckboxChange = (itemName) => {
  //   setCheckedItems((prevItems) => ({
  //     ...prevItems,
  //     [itemName]: !prevItems[itemName],
  //   }));
  // };

  // let response;
  const handleFormSubmit = async () => {
    try {
      const selectedPurposeData = purposeOptions
        .filter((purpose) => selectedPurpose.includes(purpose))
        .map((selectedPurpose) => ({
          [selectedPurpose]: checkedItems[selectedPurpose],
        }));

      // `https://notion-products-db-server-app-bee944b6684d.herokuapp.com/createNotionPage`
      const response = await axios.post(
        `https://notion-products-db-server-app-bee944b6684d.herokuapp.com/createNotionPage` ||
          `http://localhost:3001/createNotionPage`,
        {
          product,
          asin,
          StockPriceValue,
          feedback,
          selectedPurpose,
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

  const purposeOptions = [
    "値下げ交渉エビデンス",
    "刈り取り",
    "値上げ通知",
    "動向追い",
    "仕入れ判断",
    "回収",
  ];

  const handlePurposeChange = (e) => {
    const value = e.target.value;
    if (selectedPurpose.includes(value)) {
      setSelectedPurpose(
        selectedPurpose.filter((purpose) => purpose !== value)
      );
    } else {
      setSelectedPurpose([...selectedPurpose, value]);
    }
  };
  console.log(selectedPurpose, setSelectedPurpose);

  return (
    <div className="form-container">
      <h2>Web Form</h2>
      <form>
        <div className="form-input">
          <label>仕入れ値</label>
          <input
            type="text"
            value={StockPriceValue}
            onChange={(e) => setStockPriceValue(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label>感想</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label>目的別</label>
          <div className="checkbox-options">
            {purposeOptions.map((purpose) => (
              <label key={purpose} className="checkbox-label">
                <input
                  type="checkbox"
                  value={purpose}
                  checked={selectedPurpose.includes(purpose)}
                  onChange={handlePurposeChange}
                />
                <p>{purpose}</p>
              </label>
            ))}
          </div>
        </div>
        <div>
          <button type="button" onClick={handleFormSubmit}>
            送信
          </button>
        </div>
        <div>
          <textarea ref={textAreaRef} defaultValue={feedText} />
          <button
            className={`onCopy ${isCopyButtonClicked ? "copiedButton" : ""}`}
            onClick={handleCopyToClipboard}
          >
            クリップボードにコピー
          </button>
        </div>
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
      </form>
      {/* <div className="form-input">
        <Link to={`/form?product=${product}&asin=${asin}`}>保存</Link>
      </div> */}
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
