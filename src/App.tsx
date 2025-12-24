import { useState } from 'react';
import useSWR from 'swr'; // Importeer SWR
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

// De centrale lader voor je data
const fetcher = (url: string) => {
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));
  return fetch(url, { headers }).then(res => res.json());
};

function App() {
  const [filters, setFilters] = useState<Filters>({
    search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '', minArea: '', minYear: '',
    selectedTypeSlug: null, hasGarden: '', hasPool: '', hasGarage: '', hasDriveway: '',
  });
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // GEHEUGEN + BOODSCHAPPENLIJST COMBINATIE
  // We voegen &_fields=... toe om alleen de data op te halen die je filters gebruiken
  const { data: propertiesData, error, isLoading } = useSWR(
    'https://dev-property-dashboard.pantheonsite.io/wp-json/wp/v2/property?_embed&per_page=100&_fields=id,title,acf,_links,_embedded',
    fetcher,
    {
      revalidateOnFocus: false, // Niet opnieuw laden als je van tabblad wisselt
      dedupingInterval: 60000,   // Cache de lijst voor minimaal 1 minuut
    }
  );

  const properties = Array.isArray(propertiesData) ? propertiesData : [];

  const filtered = properties.filter((p) => {
    if (!p) return false;
    const acf = p.acf || {};

    if (filters.search) {
      const title = p.title?.rendered?.toLowerCase() || "";
      if (!title.includes(filters.search.toLowerCase())) return false;
    }

    const price = Number(acf.price) || 0;
    if (filters.minPrice !== '' && price < Number(filters.minPrice)) return false;
    if (filters.maxPrice !== '' && price > Number(filters.maxPrice)) return false;
    if (filters.minBedrooms !== '' && Number(acf.bedrooms || 0) < Number(filters.minBedrooms)) return false;
    if (filters.minBathrooms !== '' && Number(acf.bathrooms || 0) < Number(filters.minBathrooms)) return false;
    if (filters.minArea !== '' && Number(acf.square_footage || 0) < Number(filters.minArea)) return false;
    if (filters.minYear !== '' && Number(acf.construction_year || 0) < Number(filters.minYear)) return false;

    if (selectedType) {
      const typeMatch = acf.type === selectedType;
      const termMatch = p._embedded?.['wp:term']?.[0]?.some((t: any) => t.slug === selectedType);
      if (!typeMatch && !termMatch) return false;
    }

    if (filters.hasGarden === 'yes' && !acf.garden) return false;
    if (filters.hasGarden === 'no' && acf.garden) return false;
    if (filters.hasGarage === 'yes' && !acf.garage) return false;
    if (filters.hasGarage === 'no' && acf.garage) return false;
    if (filters.hasDriveway === 'yes' && !acf.driveway) return false;
    if (filters.hasDriveway === 'no' && acf.driveway) return false;
    if (filters.hasPool === 'yes' && !acf.pool) return false;
    if (filters.hasPool === 'no' && acf.pool) return false;

    return true;
  });

  if (isLoading) return <div className="loading">Data laden met slim geheugen...</div>;
  if (error) return <div className="error">Er is een fout opgetreden bij het ophalen van de data.</div>;

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