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
      // We zorgen dat we altijd een array hebben, zelfs bij fouten
      setProperties(Array.isArray(propData) ? propData : []);
      setPropertyTypes(Array.isArray(typeData) ? typeData : []);
      setIsLoading(false);
    })
    .catch((err) => {
      console.error("Data ophalen mislukt:", err);
      setIsLoading(false);
    });
  }, []);

  const filteredProperties = properties.filter(p => {
    // VEILIGHEID: Als de woning geen ACF data heeft, negeer hem volledig (voorkomt crashes)
    if (!p || !p.acf) return false;

    const f = currentFilters;
    const acf = p.acf;

    // 1. Zoekfilter (alleen filteren als er echt getypt is)
    if (f.search && f.search.trim() !== '') {
      const title = p.title?.rendered?.toLowerCase() || '';
      if (!title.includes(f.search.toLowerCase())) return false;
    }
    
    // 2. Prijsfilter (getallen forceren)
    const price = Number(acf.price) || 0;
    if (f.minPrice !== '' && price < Number(f.minPrice)) return false;
    if (f.maxPrice !== '' && price > Number(f.maxPrice)) return false;

    // 3. Woningtype (Taxonomie)
    if (f.selectedTypeSlug) {
      const terms = p._embedded?.['wp:term']?.[0] || [];
      const hasType = terms.some((t: any) => t.slug === f.selectedTypeSlug);
      if (!hasType) return false;
    }

    // Voor nu negeren we tuin/zwembad om te zorgen dat je ALLES ziet
    return true;
  });

  if (isLoading) return <div className="loading">Data wordt opgehaald uit WordPress...</div>;

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

      <div className="results-info">
        <span><strong>{filteredProperties.length}</strong> woningen gevonden</span>
      </div>

      <div className="property-grid">
        {filteredProperties.length > 0 ? (
          filteredProperties.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))
        ) : (
          <div className="no-data-msg">
            Geen woningen gevonden. Klik op "Alle Types" of wis je zoekopdracht.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;