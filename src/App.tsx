import { useState, useEffect } from 'react';
import PropertyCard from './components/PropertyCard';
import FilterForm from './components/FilterForm';
import type { Filters } from './components/FilterForm';
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
    search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '', minArea: '', minYear: '',
    selectedTypeSlug: null, hasGarden: '', hasPool: '', hasGarage: '', hasDriveway: '',
  });
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const API_URL = 'https://dev-property-dashboard.pantheonsite.io';
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));

    // Gebruik weer de standaard WP endpoint zodat titels, afbeeldingen én acf-data beschikbaar zijn
    fetch(`${API_URL}/wp-json/wp/v2/property?_embed&per_page=100`, { headers })
      .then(res => res.json())
      .then(data => {
        setProperties(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filtered = properties.filter((p) => {
    if (!p) return false;
    const acf = p.acf || {};

    // Zoekmatch
    if (filters.search) {
      const title = p.title?.rendered?.toLowerCase() || "";
      if (!title.includes(filters.search.toLowerCase())) return false;
    }

    // Prijsmatch (Forceer naar getal)
    const price = Number(acf.price) || 0;
    if (filters.minPrice !== '' && price < Number(filters.minPrice)) return false;
    if (filters.maxPrice !== '' && price > Number(filters.maxPrice)) return false;

    // Slaapkamers
    if (filters.minBedrooms !== '' && Number(acf.bedrooms || 0) < Number(filters.minBedrooms)) return false;
    // Badkamers
    if (filters.minBathrooms !== '' && Number(acf.bathrooms || 0) < Number(filters.minBathrooms)) return false;
    // Oppervlakte
    if (filters.minArea !== '' && Number(acf.square_footage || 0) < Number(filters.minArea)) return false;
    // Bouwjaar
    if (filters.minYear !== '' && Number(acf.construction_year || 0) < Number(filters.minYear)) return false;

    // Type match
    if (selectedType) {
      const typeMatch = acf.type === selectedType;
      const termMatch = p._embedded?.['wp:term']?.[0]?.some((t: any) => t.slug === selectedType);
      if (!typeMatch && !termMatch) return false;
    }

    // Tuin
    if (filters.hasGarden === 'yes' && !acf.garden) return false;
    if (filters.hasGarden === 'no' && acf.garden) return false;
    // Garage
    if (filters.hasGarage === 'yes' && !acf.garage) return false;
    if (filters.hasGarage === 'no' && acf.garage) return false;
    // Oprit
    if (filters.hasDriveway === 'yes' && !acf.driveway) return false;
    if (filters.hasDriveway === 'no' && acf.driveway) return false;
    // Zwembad
    if (filters.hasPool === 'yes' && !acf.pool) return false;
    if (filters.hasPool === 'no' && acf.pool) return false;

    return true;
  });

  if (isLoading) return <div className="loading">Data laden...</div>;

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
      </div>

      <div className="property-card-grid">
        {filtered.map(p => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}

export default App;