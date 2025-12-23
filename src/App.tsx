import { useState, useEffect } from 'react';
import PropertyCard from './components/PropertyCard';
import FilterForm, { type Filters } from './components/FilterForm'; 
import './App.scss';

function App() {
  const [properties, setProperties] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '',
    selectedTypeSlug: null, hasGarden: '', hasPool: '', hasGarage: '', hasDriveway: '',
  });

  useEffect(() => {
    const API_URL = 'https://dev-property-dashboard.pantheonsite.io';
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));

    Promise.all([
      fetch(`${API_URL}/wp-json/wp/v2/property?_embed&per_page=100`, { headers }).then(res => res.json()),
      fetch(`${API_URL}/wp-json/wp/v2/property_type`, { headers }).then(res => res.json())
    ])
    .then(([propData, typeData]) => {
      // DEBUG: Kijk in je console of je hier een lijst met objecten ziet!
      console.log("Data van server:", propData);
      setProperties(Array.isArray(propData) ? propData : []);
      setPropertyTypes(Array.isArray(typeData) ? typeData : []);
      setIsLoading(false);
    })
    .catch((err) => {
      console.error("Fetch fout:", err);
      setIsLoading(false);
    });
  }, []);

  const filteredProperties = properties.filter(p => {
    // STAP 1: Alleen properties met ACF data doorlaten
    if (!p || !p.acf) return false;

    const f = currentFilters;
    const acf = p.acf;

    // STAP 2: Zoekterm (alleen filteren als er echt iets getypt is)
    if (f.search.trim() !== '') {
      const title = p.title?.rendered?.toLowerCase() || '';
      if (!title.includes(f.search.toLowerCase())) return false;
    }
    
    // STAP 3: Prijs (wees heel tolerant: als er geen prijs is ingevuld, laat hem zien)
    const price = Number(acf.price);
    if (!isNaN(price) && price > 0) {
        if (f.minPrice !== '' && price < Number(f.minPrice)) return false;
        if (f.maxPrice !== '' && price > Number(f.maxPrice)) return false;
    }

    // STAP 4: Type (Knoppen)
    if (f.selectedTypeSlug) {
      const terms = p._embedded?.['wp:term']?.[0] || [];
      const hasType = terms.some((t: any) => t.slug === f.selectedTypeSlug);
      if (!hasType) return false;
    }

    // De rest van de filters (tuin/pool) negeren we nu even om te zorgen dat de lijst vult!
    return true;
  });

  if (isLoading) return <div className="loading">Data laden uit WordPress...</div>;

  return (
    <div className="container">
      <h1 className="main-title">WONINGOVERZICHT</h1>
      
      <div className="filter-wrapper">
        <FilterForm onFilterChange={setCurrentFilters} />
      </div>
      
      <div className="type-buttons-container">
        <div className="type-buttons">
          <button 
            onClick={() => setCurrentFilters({...currentFilters, selectedTypeSlug: null})}
            className={!currentFilters.selectedTypeSlug ? 'active' : ''}
          >
            Alle Types
          </button>
          {propertyTypes.map(type => (
            <button 
              key={type.id} 
              onClick={() => setCurrentFilters({...currentFilters, selectedTypeSlug: type.slug})}
              className={currentFilters.selectedTypeSlug === type.slug ? 'active' : ''}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div className="status-bar">
        <span><strong>{filteredProperties.length}</strong> woningen gevonden</span>
      </div>

      <div className="property-grid">
        {filteredProperties.length > 0 ? (
          filteredProperties.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))
        ) : (
          <div className="empty-state">
            <p>Geen woningen gevonden. Probeer je filters te resetten.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;