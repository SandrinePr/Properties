import { useState, useEffect } from 'react';
import PropertyCard from './components/PropertyCard';
import FilterForm, { type Filters } from './components/FilterForm'; 
import './App.scss';

interface Property {
  id: number;
  title: { rendered: string };
  acf: {
    price: number; // Nu een number
    bedrooms: string | number;
    bathrooms: string | number;
    square_footage: string | number;
    garden: boolean; // Nieuwe naam uit JSON
    pool: boolean;
    garage: boolean;
    driveway: boolean;
    construction_year: string | number;
    description: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: [{ source_url: string }];
    'wp:term'?: [TaxonomyTerm[]];
  };
}

interface TaxonomyTerm { id: number; name: string; slug: string; }

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<TaxonomyTerm[]>([]); 
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
    .catch(err => { console.error("API Error:", err); setIsLoading(false); });
  }, []);

  const handleTypeFilter = (slug: string | null) => {
    setCurrentFilters(prev => ({ ...prev, selectedTypeSlug: slug === prev.selectedTypeSlug ? null : slug }));
  };

  const filteredProperties = properties.filter(property => {
    const f = currentFilters;
    const acf = property.acf || {};

    // Filter logica
    if (f.search && !property.title.rendered.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.minPrice !== '' && acf.price < f.minPrice) return false;
    if (f.maxPrice !== '' && acf.price > f.maxPrice) return false;
    if (f.minBedrooms !== '' && Number(acf.bedrooms) < f.minBedrooms) return false;

    if (f.selectedTypeSlug) {
      const terms = property._embedded?.['wp:term']?.[0] || [];
      if (!terms.some(t => t.slug === f.selectedTypeSlug)) return false;
    }

    // Koppeling met de nieuwe boolean velden
    if (f.hasGarden !== '' && (acf.garden ? 'yes' : 'no') !== f.hasGarden) return false;
    if (f.hasPool !== '' && (acf.pool ? 'yes' : 'no') !== f.hasPool) return false;
    if (f.hasGarage !== '' && (acf.garage ? 'yes' : 'no') !== f.hasGarage) return false;
    if (f.hasDriveway !== '' && (acf.driveway ? 'yes' : 'no') !== f.hasDriveway) return false;

    return true;
  });

  if (isLoading) return <div className="loading">Laden...</div>;

  return (
    <div className="container">
      <h1>Vastgoed Dashboard</h1>
      <FilterForm onFilterChange={(f) => setCurrentFilters(f)} />
      
      <div className="type-filter-container">
        <h3>Filter op type:</h3>
        <div className="type-buttons">
          <button onClick={() => handleTypeFilter(null)} className={currentFilters.selectedTypeSlug === null ? 'active' : ''}>Alle Types</button>
          {propertyTypes.map(type => (
            <button key={type.id} onClick={() => handleTypeFilter(type.slug)} className={currentFilters.selectedTypeSlug === type.slug ? 'active' : ''}>{type.name}</button>
          ))}
        </div>
      </div>

      <div className="results-count"><strong>{filteredProperties.length}</strong> resultaten gevonden</div>

      <div className="property-card-grid">
        {filteredProperties.map(p => <PropertyCard key={p.id} property={p} />)}
      </div>
    </div>
  );
}

export default App;