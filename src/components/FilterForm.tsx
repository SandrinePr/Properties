import React, { useState } from 'react';

export interface Filters {
  search: string;
  minPrice: number | '';
  maxPrice: number | '';
  minBedrooms: number | '';
  minBathrooms: number | '';
  selectedTypeSlug: string | null;
  hasGarden: 'yes' | 'no' | '';
  hasPool: 'yes' | 'no' | '';
  hasGarage: 'yes' | 'no' | '';
  hasDriveway: 'yes' | 'no' | '';
}

interface FilterFormProps {
  onFilterChange: (filters: Filters) => void;
}

const FilterForm: React.FC<FilterFormProps> = ({ onFilterChange }) => {
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '',
    selectedTypeSlug: null, hasGarden: '', hasPool: '', hasGarage: '', hasDriveway: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = (['minPrice', 'maxPrice', 'minBedrooms'].includes(name)) 
                ? (value === '' ? '' : Number(value)) 
                : value;

    const newFilters = { ...currentFilters, [name]: val };
    setCurrentFilters(newFilters as Filters);
    onFilterChange(newFilters as Filters);
  };

  return (
    <div className="filter-box">
      <div className="filter-grid">
        <div className="input-group">
          <label>Zoeken</label>
          <input name="search" type="text" value={currentFilters.search} onChange={handleChange} placeholder="Locatie of titel..." />
        </div>
        <div className="input-group">
          <label>Min. Prijs</label>
          <input name="minPrice" type="number" value={currentFilters.minPrice} onChange={handleChange} placeholder="0" />
        </div>
        <div className="input-group">
          <label>Max. Prijs</label>
          <input name="maxPrice" type="number" value={currentFilters.maxPrice} onChange={handleChange} placeholder="Geen limiet" />
        </div>
      </div>

      <div className="button-group" style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
        <button type="button" className="btn-secondary" onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? 'Minder filters' : 'Meer filters'}
        </button>
      </div>
    </div>
  );
};

export default FilterForm;