import { useState, useEffect } from 'react';
import PropertyCard from './components/PropertyCard';
import FilterForm, { type Filters } from './components/FilterForm'; 
import './App.scss';

interface Property {
  id: number;
  title: { rendered: string };
  acf: {
    price: number;
    bedrooms: number;
    bathrooms: number;
    square_footage: number;
    garden: boolean; 
    pool: boolean;
    garage: boolean;
    driveway: boolean;
    property_gallery: number[]; // Voor de meerdere afbeeldingen
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
    .catch(() => setIsLoading(false));
  }, []);

  const handleTypeFilter = (slug: string | null) => {
    setCurrentFilters(prev => ({ ...prev, selectedTypeSlug: slug === prev.selectedTypeSlug ? null : slug }));
  };

  const filteredProperties = properties.filter(p => {
    const f = currentFilters;
    const acf = p.acf || {};
    const checkBool = (val: any, filter: string) => filter === '' ? true : (filter === 'yes' ? !!val : !val);

    if (f.search && !p.title.rendered.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.minPrice !== '' && (acf.price || 0) < Number(f.minPrice)) return false;
    if (f.maxPrice !== '' && (acf.price || 0) > Number(f.maxPrice)) return false;
    if (f.minBedrooms !== '' && (acf.bedrooms || 0) < Number(f.minBedrooms)) return false;
    if (f.minBathrooms !== '' && (acf.bathrooms || 0) < Number(f.minBathrooms)) return false;
    if (f.selectedTypeSlug && !p._embedded?.['wp:term']?.[0]?.some(t => t.slug === f.selectedTypeSlug)) return false;
    
    if (!checkBool(acf.garden, f.hasGarden)) return false;
    if (!checkBool(acf.pool, f.hasPool)) return false;
    if (!checkBool(acf.garage, f.hasGarage)) return false;
    if (!checkBool(acf.driveway, f.hasDriveway)) return false;

    return true;
  });

  if (isLoading) return <div className="loading">Laden...</div>;

  return (
    <div className="container">
      <h1>Vastgoed Dashboard</h1>
      <FilterForm onFilterChange={setCurrentFilters} />
      
      <div className="type-filter">
        {propertyTypes.map(type => (
          <button key={type.id} onClick={() => handleTypeFilter(type.slug)} className={currentFilters.selectedTypeSlug === type.slug ? 'active' : ''}>
            {type.name}
          </button>
        ))}
      </div>

      <div className="property-card-grid">
        {filteredProperties.map(p => <PropertyCard key={p.id} property={p} />)}
      </div>
    </div>
  );
}

export default App;