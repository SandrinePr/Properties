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
    // Zorg dat getallen ook als getallen worden opgeslagen voor de filtering
    const val = (['minPrice', 'maxPrice', 'minBedrooms', 'minBathrooms'].includes(name)) 
                ? (value !== '' ? parseInt(value, 10) : '') 
                : value;

    const newFilters = { ...currentFilters, [name]: val };
    setCurrentFilters(newFilters as Filters);
    onFilterChange(newFilters as Filters);
  };

  return (
    <div className="filter-box">
      <h2>Zoek & Filter</h2>
      <div className="filter-grid">
        <div className="input-group">
          <label>Locatie</label>
          <input name="search" type="text" value={currentFilters.search} onChange={handleChange} placeholder="Straat of stad..." />
        </div>
        <div className="input-group">
          <label>Min. Prijs</label>
          <input name="minPrice" type="number" value={currentFilters.minPrice} onChange={handleChange} placeholder="€ 0" />
        </div>
        <div className="input-group">
          <label>Max. Prijs</label>
          <input name="maxPrice" type="number" value={currentFilters.maxPrice} onChange={handleChange} placeholder="€ Geen limiet" />
        </div>
      </div>

      <div className="button-group">
        <button type="button" className="btn-secondary" onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? 'Minder filters' : 'Meer filters'}
        </button>

        {showAdvanced && (
          <div className="advanced-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', width: '100%', marginTop: '20px'}}>
             <div className="input-group">
                <label>Slaapkamers</label>
                <input name="minBedrooms" type="number" value={currentFilters.minBedrooms} onChange={handleChange} placeholder="Aantal" />
             </div>
             <div className="input-group">
                <label>Tuin</label>
                <select name="hasGarden" value={currentFilters.hasGarden} onChange={handleChange}>
                  <option value="">Alle</option>
                  <option value="yes">Ja</option>
                  <option value="no">Nee</option>
                </select>
             </div>
          </div>
        )}
        <button className="btn-primary" onClick={() => window.location.reload()}>Reset Filters</button>
      </div>
    </div>
  );
};

export default FilterForm;