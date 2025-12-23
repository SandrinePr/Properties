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
      console.log("Ruwe data binnen:", propData);
      setProperties(Array.isArray(propData) ? propData : []);
      setPropertyTypes(Array.isArray(typeData) ? typeData : []);
      setIsLoading(false);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      setIsLoading(false);
    });
  }, []);

  const filteredProperties = properties.filter(p => {
    // 1. Veiligheid: Skip woningen zonder data zodat de boel niet crasht
    if (!p || !p.acf) return false;

    const f = currentFilters;
    const acf = p.acf;

    // 2. Zoekfilter (Alleen als er iets getypt is)
    if (f.search && !p.title?.rendered?.toLowerCase().includes(f.search.toLowerCase())) {
        return false;
    }
    
    // 3. Prijsfilters (Alleen als er een getal is ingevuld)
    const price = Number(acf.price) || 0;
    if (f.minPrice !== '' && price < Number(f.minPrice)) return false;
    if (f.maxPrice !== '' && price > Number(f.maxPrice)) return false;

    // 4. Slaapkamers filter
    if (f.minBedrooms !== '' && (Number(acf.bedrooms) || 0) < Number(f.minBedrooms)) return false;

    // 5. Woningtype filter (De knoppen onder de zoekbalk)
    if (f.selectedTypeSlug) {
      const terms = p._embedded?.['wp:term']?.[0] || [];
      const hasType = terms.some((t: any) => t.slug === f.selectedTypeSlug);
      if (!hasType) return false;
    }

    // WE LATEN DE BOOLEANS (TUIN/ZWEMBAD) HIER EVEN WEG VOOR MAXIMAAL RESULTAAT
    return true;
  });

  if (isLoading) return <div className="loading">Laden...</div>;

  return (
    <div className="container">
      <h1 className="main-title">WONINGOVERZICHT</h1>
      
      <div className="filter-section">
        <FilterForm onFilterChange={setCurrentFilters} />
      </div>
      
      <div className="type-filter-container">
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

      <div className="results-count-wrapper">
        <span className="results-count"><strong>{filteredProperties.length}</strong> resultaten gevonden</span>
      </div>

      <div className="property-card-grid">
        {filteredProperties.length > 0 ? (
          filteredProperties.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))
        ) : (
          <div className="no-results">Geen woningen gevonden die voldoen aan je zoekopdracht.</div>
        )}
      </div>
    </div>
  );
}

export default App;