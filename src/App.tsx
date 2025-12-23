import { useState, useEffect } from 'react';
import PropertyCard from './components/PropertyCard';
import FilterForm, { Filters } from './components/FilterForm';
import './App.scss';

const PROPERTY_TYPES = [
  { label: 'Alle Types', slug: null },
  { label: 'Apartment', slug: 'apartment' },
  { label: 'Bungalow', slug: 'bungalow' },
  { label: 'Commercial', slug: 'commercial' },
  { label: 'House', slug: 'house' },
  { label: 'Penthouse', slug: 'penthouse' },
  { label: 'Studio', slug: 'studio' },
  { label: 'Villa', slug: 'villa' },
];

function App() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '',
    selectedTypeSlug: null, hasGarden: '', hasPool: '', hasGarage: '', hasDriveway: '',
  });
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const API_URL = 'https://dev-property-dashboard.pantheonsite.io';
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));

    fetch(`${API_URL}/wp-json/wp/v2/property?_embed&per_page=100`, { headers })
      .then(res => res.json())
      .then(data => {
        setProperties(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
      });
  }, []);

  // Filter logica
  const filtered = properties.filter((p) => {
    const acf = p.acf || {};
    // Zoek op titel of locatie
    const searchMatch =
      !filters.search ||
      (p.title?.rendered?.toLowerCase().includes(filters.search.toLowerCase()) ||
        (acf.location && acf.location.toLowerCase().includes(filters.search.toLowerCase())));
    // Prijs
    const minPriceMatch = !filters.minPrice || (acf.price && Number(acf.price) >= Number(filters.minPrice));
    const maxPriceMatch = !filters.maxPrice || (acf.price && Number(acf.price) <= Number(filters.maxPrice));
    // Slaapkamers
    const minBedroomsMatch = !filters.minBedrooms || (acf.bedrooms && Number(acf.bedrooms) >= Number(filters.minBedrooms));
    // Type
    const typeMatch = !selectedType || !acf.type || acf.type === selectedType;
    // Tuin
    const gardenMatch = !filters.hasGarden || (filters.hasGarden === 'yes' ? acf.garden === true : acf.garden === false);
    return searchMatch && minPriceMatch && maxPriceMatch && minBedroomsMatch && typeMatch && gardenMatch;
  });

  if (isLoading) return <div className="loading">Data wordt opgehaald uit WordPress...</div>;

  return (
    <div className="container">
      <h1>WONINGOVERZICHT</h1>
      <FilterForm onFilterChange={setFilters} />

      <div className="type-filter-container">
        <div className="type-buttons">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.label}
              className={selectedType === type.slug ? 'active' : ''}
              onClick={() => setSelectedType(type.slug)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="results-count">
        <strong>{filtered.length}</strong> resultaten gevonden
        {filtered.length === 0 && <div>Geen woningen gevonden die voldoen aan je zoekopdracht.</div>}
      </div>

      <div className="property-card-grid">
        {filtered.length > 0 ? (
          filtered.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))
        ) : null}
      </div>
    </div>
  );
}

export default App;