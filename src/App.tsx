import { useState, useEffect } from 'react';
import PropertyCard from './components/PropertyCard';
import FilterForm, { type Filters } from './components/FilterForm'; 
import './App.scss';

interface Property {
  id: number;
  title: { rendered: string };
  acf: {
    price: number | string;
    bedrooms: number | string;
    bathrooms: number | string;
    square_footage: number | string;
    garden: boolean; 
    pool: boolean;
    garage: boolean;
    driveway: boolean;
    description: string;
    construction_year: number | string;
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

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<TaxonomyTerm[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '',
    selectedTypeSlug: null, hasGarden: '', hasPool: '', hasGarage: '', hasDriveway: '',
  });

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'https://dev-property-dashboard.pantheonsite.io';
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
    .catch(err => {
      console.error("API Fout:", err);
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
    const acf = property.acf || {};
    
    const checkBool = (val: any, filterVal: string) => {
      if (filterVal === '') return true;
      const isTrue = val === true || val === '1' || val === 1;
      return filterVal === 'yes' ? isTrue : !isTrue;
    };

    if (f.search && !property.title.rendered.toLowerCase().includes(f.search.toLowerCase())) return false;
    
    const price = Number(acf.price) || 0;
    if (f.minPrice !== '' && price < Number(f.minPrice)) return false;
    if (f.maxPrice !== '' && price > Number(f.maxPrice)) return false;

    if (f.minBedrooms !== '' && Number(acf.bedrooms) < Number(f.minBedrooms)) return false;

    if (f.selectedTypeSlug) {
      const terms = property._embedded?.['wp:term']?.[0] || [];
      if (!terms.some(t => t.slug === f.selectedTypeSlug)) return false;
    }

    if (!checkBool(acf.garden, f.hasGarden)) return false;
    if (!checkBool(acf.pool, f.hasPool)) return false;
    if (!checkBool(acf.garage, f.hasGarage)) return false;
    if (!checkBool(acf.driveway, f.hasDriveway)) return false;

    return true;
  });

  if (isLoading) return <div className="loading">Laden van vastgoed data...</div>;

  return (
    <div className="container">
      <h1>Vastgoed Dashboard</h1>
      <FilterForm onFilterChange={(f) => setCurrentFilters(f)} />
      
      <div className="type-filter-container">
        <h3>Type woning:</h3>
        <div className="type-buttons">
          <button onClick={() => handleTypeFilter(null)} className={currentFilters.selectedTypeSlug === null ? 'active' : ''}>Alle</button>
          {propertyTypes.map(type => (
            <button key={type.id} onClick={() => handleTypeFilter(type.slug)} className={currentFilters.selectedTypeSlug === type.slug ? 'active' : ''}>
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div className="property-card-grid">
        {filteredProperties.map(p => <PropertyCard key={p.id} property={p} />)}
      </div>
    </div>
  );
}

export default App;