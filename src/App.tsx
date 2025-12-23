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
    .catch((err) => {
      console.error("Fetch error:", err);
      setIsLoading(false);
    });
  }, []);

  const filteredProperties = properties.filter(p => {
    // VEILIGHEID: Als p of p.acf niet bestaat, negeer deze woning zodat de site niet crasht
    if (!p || !p.acf) return false;

    const f = currentFilters;
    const acf = p.acf;

    // Filter op titel
    if (f.search && !p.title.rendered.toLowerCase().includes(f.search.toLowerCase())) return false;
    
    // Filter op prijs
    const price = Number(acf.price) || 0;
    if (f.minPrice !== '' && price < Number(f.minPrice)) return false;
    if (f.maxPrice !== '' && price > Number(f.maxPrice)) return false;

    // Filter op slaapkamers
    const bedrooms = Number(acf.bedrooms) || 0;
    if (f.minBedrooms !== '' && bedrooms < Number(f.minBedrooms)) return false;

    // Filter op type (Taxonomie)
    if (f.selectedTypeSlug) {
      const terms = p._embedded?.['wp:term']?.[0] || [];
      if (!terms.some((t: any) => t.slug === f.selectedTypeSlug)) return false;
    }

    // Filter op extra's (Boolean checks)
    const checkExtra = (hasFeature: any, filterValue: string) => {
      if (filterValue === '') return true;
      return filterValue === 'yes' ? hasFeature === true : hasFeature === false;
    };

    if (!checkExtra(acf.garden, f.hasGarden)) return false;
    if (!checkExtra(acf.pool, f.hasPool)) return false;
    if (!checkExtra(acf.garage, f.hasGarage)) return false;
    if (!checkExtra(acf.driveway, f.hasDriveway)) return false;

    return true;
  });

  if (isLoading) return <div className="loading">Data ophalen uit WordPress...</div>;

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
        {filteredProperties.map(p => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}

export default App;