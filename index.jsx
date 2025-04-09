import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const sampleCSV = `word,meaning,etymology,topic\napple,a fruit,germanic,daily life\ntractor,a farm vehicle,slavic,agriculture\njoke,something funny,romance,humor`;

function loadCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");
  const entries = lines.slice(1).map(line => {
    const data = line.split(",");
    if (data.length !== headers.length) return null;
    const obj = {};
    headers.forEach((h, i) => (obj[h] = data[i]));
    obj.status = "none";
    return obj;
  }).filter(Boolean);
  localStorage.setItem("dictionary", JSON.stringify(entries));
}

function getEntries() {
  return JSON.parse(localStorage.getItem("dictionary") || "[]");
}

function saveEntries(entries) {
  localStorage.setItem("dictionary", JSON.stringify(entries));
}

const DictionaryPage = ({ adminMode }) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  const handleEdit = (index) => {
    const newMeaning = prompt("Enter new meaning:", entries[index].meaning);
    if (newMeaning && newMeaning !== entries[index].meaning) {
      const updated = [...entries];
      updated[index].editedVersion = `${entries[index].word}. ${newMeaning}`;
      updated[index].status = "pending";
      setEntries(updated);
      saveEntries(updated);
    }
  };

  const handleConfirm = (index) => {
    const updated = [...entries];
    const parts = updated[index].editedVersion.split(". ");
    updated[index].meaning = parts.slice(1).join(". ");
    updated[index].editedVersion = "";
    updated[index].status = "confirmed";
    setEntries(updated);
    saveEntries(updated);
  };

  const handleReject = (index) => {
    const updated = [...entries];
    updated[index].editedVersion = "";
    updated[index].status = "none";
    setEntries(updated);
    saveEntries(updated);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        {adminMode ? "Admin Panel" : "Dictionary"}
      </h1>
      {entries.map((entry, i) => (
        <div key={i} className="mb-2 border p-2 rounded shadow-sm">
          <div>
            <strong>{entry.word}</strong>. {entry.meaning}
          </div>
          {entry.status === "pending" && entry.editedVersion && (
            <div className="text-gray-500 italic">
              Proposed: {entry.editedVersion}
            </div>
          )}
          <div className="mt-2 space-x-2">
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => handleEdit(i)}
            >
              Edit
            </button>
            {adminMode && entry.status === "pending" && (
              <>
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => handleConfirm(i)}
                >
                  Confirm
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleReject(i)}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const AnalysisPage = () => {
  const entries = getEntries();
  const etymologyCount = {};
  const topicCount = {};

  entries.forEach((entry) => {
    etymologyCount[entry.etymology] = (etymologyCount[entry.etymology] || 0) + 1;
    topicCount[entry.topic] = (topicCount[entry.topic] || 0) + 1;
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Analysis</h1>
      <div className="w-full md:w-1/2 mb-6">
        <h2 className="text-lg font-semibold mb-2">Etymology Distribution</h2>
        <Pie
          data={{
            labels: Object.keys(etymologyCount),
            datasets: [
              {
                data: Object.values(etymologyCount),
                backgroundColor: ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"],
              },
            ],
          }}
        />
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Word Topics (Raw)</h2>
        <div className="p-2 bg-gray-100 rounded">
          {Object.entries(topicCount)
            .map(([topic, count]) => (
              <span key={topic} className="mr-4">
                {topic} ({count})
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

const CSVImport = () => {
  const handleClick = () => {
    loadCSV(sampleCSV);
    alert("Sample data loaded.");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Import Dictionary Data</h1>
      <button
        onClick={handleClick}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Load Sample CSV
      </button>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-200 flex gap-4">
        <Link to="/">Dictionary</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/analysis">Analysis</Link>
        <Link to="/import">Import</Link>
      </nav>
      <Routes>
        <Route path="/" element={<DictionaryPage adminMode={false} />} />
        <Route path="/admin" element={<DictionaryPage adminMode={true} />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/import" element={<CSVImport />} />
      </Routes>
    </Router>
  );
}
