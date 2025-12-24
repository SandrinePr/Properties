import React, { useState } from 'react';
import useSWR from 'swr';
import PropertyCard from './PropertyCard';
import FilterForm from './FilterForm';
import type { Filters } from './FilterForm';

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

const fetcher = (url: string) => 
  fetch(url, {
    headers: { 'Authorization': 'Basic ' + btoa('staple:temporary') }
  }).then(res => res.json());

const Properties: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '', minArea: '', minYear: '',
    selectedTypeSlug: null, hasGarden: '', hasPool: '', hasGarage: '', hasDriveway: '',
  });
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // SWR vervangt je useEffect en useState voor properties
  const { data: propertiesData, isLoading } = useSWR(
    'https://dev-property-dashboard.pantheonsite.io/wp-json/wp/v2/property?_embed&per_page=100&_fields=id,title,acf,_links,_embedded',
    fetcher
  );

  const properties = Array.isArray(propertiesData) ? propertiesData : [];

  const filtered = properties.filter((p) => {
    if (!p) return false;
    const acf = p.acf || {};
    if (filters.search && !(p.title?.rendered?.toLowerCase() || "").includes(filters.search.toLowerCase())) return false;
    const price = Number(acf.price) || 0;
    if (filters.minPrice !== '' && price < Number(filters.minPrice)) return false;
    if (filters.maxPrice !== '' && price > Number(filters.maxPrice)) return false;
    if (filters.minBedrooms !== '' && Number(acf.bedrooms || 0) < Number(filters.minBedrooms)) return false;
    if (filters.minArea !== '' && Number(acf.square_footage || 0) < Number(filters.minArea)) return false;

    if (selectedType) {
      const typeMatch = acf.type === selectedType;
      const termMatch = p._embedded?.['wp:term']?.[0]?.some((t: any) => t.slug === selectedType);
      if (!typeMatch && !termMatch) return false;
    }

    if (filters.hasGarden === 'yes' && !acf.garden) return false;
    if (filters.hasPool === 'yes' && !acf.pool) return false;
    return true;
  });

  if (isLoading) return <div className="loading">Data laden met cache...</div>;

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
      <div className="results-count"><strong>{filtered.length}</strong> resultaten</div>
      <div className="property-card-grid">
        {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
      </div>
    </div>
  );
};

export default Properties;