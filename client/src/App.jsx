import React, { useState } from "react";
import axios from "axios";

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const runScript = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/run-script");
      setData(response.data);
    } catch (error) {
      console.error("Error running script:", error);
    }
    setLoading(false);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-5">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-700 mb-6">
          Twitter Trending Topics Scrapper
        </h1>
        <div className="text-center mb-6">
          <button
            onClick={runScript}
            disabled={loading}
            className={`px-6 py-3 w-full sm:w-auto font-semibold rounded-lg text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            {loading ? "Running Script..." : "Click here to run the script"}
          </button>
        </div>
        {data && (
          <div className="mt-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
              Trending Topics as of{" "}
              <span className="text-gray-800">
                {formatTimestamp(data.timestamp)}
              </span>
            </h2>
            <ul className="list-disc list-inside mb-4">
              {data.trends.map((trend, index) => (
                <li key={index} className="text-gray-600">
                  {trend}
                </li>
              ))}
            </ul>
            <p className="text-gray-600">
              IP Address:{" "}
              <span className="font-semibold">{data.ip_address}</span>
            </p>
            <h3 className="text-lg font-semibold text-gray-700 mt-6">
              JSON Extract:
            </h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 mt-2 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        <div className="text-center mt-6">
          <button
            onClick={runScript}
            disabled={loading}
            className={`px-6 py-3 w-full sm:w-auto font-semibold rounded-lg text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            {loading ? "Running Script..." : "Click here to run the script again"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
