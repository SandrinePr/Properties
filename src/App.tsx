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
      setProperties(Array.isArray(propData) ? propData : []);
      setPropertyTypes(Array.isArray(typeData) ? typeData : []);
      setIsLoading(false);
    })
    .catch(() => setIsLoading(false));
  }, []);

  const filteredProperties = properties.filter(p => {
    if (!p.acf) return false;
    const f = currentFilters;
    const acf = p.acf;

    if (f.search && !p.title.rendered.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.minPrice !== '' && Number(acf.price) < Number(f.minPrice)) return false;
    if (f.maxPrice !== '' && Number(acf.price) > Number(f.maxPrice)) return false;
    if (f.minBedrooms !== '' && Number(acf.bedrooms) < Number(f.minBedrooms)) return false;

    if (f.selectedTypeSlug) {
      const terms = p._embedded?.['wp:term']?.[0] || [];
      if (!terms.some((t: any) => t.slug === f.selectedTypeSlug)) return false;
    }

    const checkBool = (val: any, filter: string) => {
      if (filter === '') return true;
      const isTrue = val === true || val === "1" || val === 1;
      return filter === 'yes' ? isTrue : !isTrue;
    };

    if (!checkBool(acf.garden, f.hasGarden)) return false;
    if (!checkBool(acf.pool, f.hasPool)) return false;

    return true;
  });

  if (isLoading) return <div className="loading">Laden...</div>;

  return (
    <div className="container">
      <h1>Vastgoed Dashboard</h1>
      <FilterForm onFilterChange={setCurrentFilters} />
      
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

      <div className="results-count">
        <strong>{filteredProperties.length}</strong> resultaten gevonden
      </div>

      <div className="property-card-grid">
        {filteredProperties.map(p => <PropertyCard key={p.id} property={p} />)}
      </div>
    </div>
  );
}

export default App;