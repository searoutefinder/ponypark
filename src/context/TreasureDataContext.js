import Papa from "papaparse";
import { createContext, useContext, useEffect, useState } from "react";

const TREASURE_CSV_URL = process.env.NEXT_PUBLIC_TREASURE_SHEET;

const TreasureDataContext = createContext({
  rows: [],
  loading: true,
  loaded: false,
  error: null,
  reload: async () => {},
});

function parseCsv(text) {
  const parsed = Papa.parse(String(text ?? ""), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0].message);
  }

  return parsed.data;
}

export function TreasureDataProvider({ children }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const loadRows = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(TREASURE_CSV_URL);

      if (!response.ok) {
        throw new Error(`Treasure data CSV request failed with status ${response.status}`);
      }

      const csvText = await response.text();
      const csvData = parseCsv(csvText);

      setRows(csvData);
      setLoaded(true);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  if (loading) {
    return <div className="w-screen h-screen flex justify-center items-center"><span>Loading treasure data...</span></div>;
  }

  if (error) {
    return <div className="w-screen h-screen flex justify-center items-center"><span>Error loading data...</span></div>;;
  }  

  return (
    <TreasureDataContext.Provider
      value={{
        rows,
        loading,
        loaded,
        error,
        reload: loadRows,
      }}
    >
      {children}
    </TreasureDataContext.Provider>
  );
}

export function useTreasureData() {
  return useContext(TreasureDataContext);
}
