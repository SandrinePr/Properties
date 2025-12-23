import { useState, useEffect } from 'react';
import PropertyCard from './components/PropertyCard';
import './App.scss';

function App() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const API_URL = 'https://dev-property-dashboard.pantheonsite.io';
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));

    fetch(`${API_URL}/wp-json/wp/v2/property?_embed&per_page=100`, { headers })
      .then(res => res.json())
      .then(data => {
        console.log("Data ontvangen:", data); // Check je browser console!
        setProperties(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Fout bij ophalen:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="loading">Data wordt opgehaald uit WordPress...</div>;

  return (
    <div className="container">
      <h1>Woning Aanbod ({properties.length})</h1>
      
      <div className="property-card-grid">
        {properties.length > 0 ? (
          properties.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))
        ) : (
          <div className="no-data">
            <p>Er zijn geen woningen gevonden in de database.</p>
            <p>Check of je in WordPress wel woningen hebt gepubliceerd.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;