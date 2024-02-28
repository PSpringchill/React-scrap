import React, { useState } from 'react';
import axios from 'axios';

const ScrapingApp = () => {
  const [query, setQuery] = useState(''); // To hold the search query
  const [scrapedData, setScrapedData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // Adjust the endpoint or parameters as needed for your backend implementation
      const response = await axios.get('https://react-scrap.vercel.app/googleSearch', {
        params: { query }
      });
      setScrapedData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please try again.');
    }
  };

  const handleQueryChange = (event) => setQuery(event.target.value);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchData();
  };

  return (
    <div>
      <h1>Google Search Scraping Tool</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter search query:
          <input type="text" value={query} onChange={handleQueryChange} />
        </label>
        <br />
        <button type="submit">Search</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <h2>Search Results</h2>
        <ul>
          {scrapedData.map((item, index) => (
            <li key={index}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">{item.pageTitle}</a>
              <p>{item.pageText}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ScrapingApp;
