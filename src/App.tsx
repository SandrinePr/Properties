// src/App.tsx
import { useState, useEffect } from 'react';
import PropertyCard from './components/PropertyCard';
import FilterForm, { type Filters } from './components/FilterForm'; 
import './App.scss';

// interface
interface Property {
  id: number;
  title: { rendered: string };
  acf: {
    price: string;
    bedrooms: string;
    bathrooms: string;
    square_footage: string;
    has_garden: boolean; 
    has_pool: boolean;
    has_garage: boolean;
    has_driveway: boolean;
    construction_year: string;
    description: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: [{ source_url: string }];
    'wp:term'?: [TaxonomyTerm[]];
  };
}

interface TaxonomyTerm {
  id: number;
  name: string;
  slug: string;
}

// homepage
function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<TaxonomyTerm[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '',
    selectedTypeSlug: null, hasGarden: '', hasPool: '', hasGarage: '', hasDriveway: '',
  });

  useEffect(() => {
    // We forceren hier direct de URL om alle Render-instellingen te omzeilen
    const API_URL = 'https://staple:temporary@dull-basketball.localsite.io';

    Promise.all([
      fetch(`${API_URL}/wp-json/wp/v2/property?_embed&per_page=100`).then(res => {
        if (!res.ok) throw new Error('Property data niet gevonden');
        return res.json();
      }),
      fetch(`${API_URL}/wp-json/wp/v2/property_type`).then(res => {
        if (!res.ok) throw new Error('Property types niet gevonden');
        return res.json();
      })
    ])
    .then(([propData, typeData]) => {
      setProperties(Array.isArray(propData) ? propData : []);
      setPropertyTypes(Array.isArray(typeData) ? typeData : []);
      setIsLoading(false);
    })
    .catch(err => {
      console.error("API Error:", err);
      setIsLoading(false);
    });
  }, []);

  const handleTypeFilter = (slug: string | null) => {
    setCurrentFilters(prev => ({ 
      ...prev, 
      selectedTypeSlug: slug === prev.selectedTypeSlug ? null : slug 
    }));
  };

  const filteredProperties = properties.filter(property => {
    const f = currentFilters;
    const acfToBool = (val: any) => (val === true || val === '1' || val === 1) ? 'yes' : 'no';

    if (f.search && !property.title.rendered.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.minPrice !== '' && parseInt(property.acf.price) < f.minPrice) return false;
    if (f.maxPrice !== '' && parseInt(property.acf.price) > f.maxPrice) return false;
    if (f.minBedrooms !== '' && parseInt(property.acf.bedrooms) < f.minBedrooms) return false;
    if (f.minBathrooms !== '' && parseInt(property.acf.bathrooms) < f.minBathrooms) return false;

    if (f.selectedTypeSlug) {
      const terms = property._embedded?.['wp:term']?.[0] || [];
      if (!terms.some(t => t.slug === f.selectedTypeSlug)) return false;
    }

    if (f.hasGarden !== '' && acfToBool(property.acf.has_garden) !== f.hasGarden) return false;
    if (f.hasPool !== '' && acfToBool(property.acf.has_pool) !== f.hasPool) return false;
    if (f.hasGarage !== '' && acfToBool(property.acf.has_garage) !== f.hasGarage) return false;
    if (f.hasDriveway !== '' && acfToBool(property.acf.has_driveway) !== f.hasDriveway) return false;

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
          <button 
            onClick={() => handleTypeFilter(null)}
            className={currentFilters.selectedTypeSlug === null ? 'active' : ''}
          >
            Alle Types
          </button>
          {propertyTypes.map(type => (
            <button 
              key={type.id} 
              onClick={() => handleTypeFilter(type.slug)}
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