import axios from "axios";
import React from "react";
import { Verse } from "./types";

export default function App() {
  const [apiUrl, setApiUrl] = React.useState("");
  const [response, setResponse] = React.useState<{verses: Verse[]}>();
  const [text, setText] = React.useState(
    "https://api.quran.com/api/v4/quran/verses/uthmani"
  );

  console.log(response);

  React.useEffect(() => {
    if (apiUrl) {
      console.log("fetching --> ", apiUrl);
      axios
        .get(apiUrl, {
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        })
        .then((resp) => setResponse(resp?.data));
    }
  }, [apiUrl]);
  return (
    <div className="App">
      <input
        type="text"
        onChange={(e) => {
          setText(e.target.value);
        }}
        value={text}
        className="url-input"
        defaultValue="https://api.quran.com/api/v4/quran/verses/uthmani"
      />
      <button className="url-submit-btn" onClick={() => setApiUrl(text)}>
        Fetch
      </button>
      <div className="view-area">
        {true && (
          <textarea
            value={JSON.stringify(response || {}, null, 2)}
            className="response-area"
          />
        )}
        {true && (
          <div className="verses-list">
            {response?.verses &&
              (response?.verses || []).map((ver) => {
                return <div className="verse-wrapper">{ver?.text_uthmani}</div>;
              })}
          </div>
        )}
      </div>
    </div>
  );
}
