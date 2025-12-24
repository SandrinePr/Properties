import React, { useState } from 'react';

export interface Filters {
  search: string;
  minPrice: number | '';
  maxPrice: number | '';
  minBedrooms: number | '';
  minBathrooms: number | '';
  minArea: number | '';
  minYear: number | '';
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
    search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '', minArea: '', minYear: '',
    selectedTypeSlug: null, hasGarden: '', hasPool: '', hasGarage: '', hasDriveway: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const val = (['minPrice', 'maxPrice', 'minBedrooms', 'minBathrooms', 'minArea', 'minYear'].includes(name)) 
          ? (value !== '' ? parseInt(value, 10) : '') 
          : value;

    const newFilters = { ...currentFilters, [name]: val };
    setCurrentFilters(newFilters as Filters);
    onFilterChange(newFilters as Filters);
  };

  return (
    <div className="filter-box">
      {/* Inline style tag op de juiste React manier */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <h2>Zoek & Filter</h2>
      <div className="filter-grid">
        <div className="input-group">
          <label htmlFor="search">Locatie</label>
          <input id="search" name="search" type="text" value={currentFilters.search} onChange={handleChange} placeholder="Straat of stad..." />
        </div>
        <div className="input-group">
          <label htmlFor="minPrice">Min. Prijs</label>
          <input id="minPrice" name="minPrice" type="number" min="0" value={currentFilters.minPrice} onChange={handleChange} placeholder="€ 0" />
        </div>
        <div className="input-group">
          <label htmlFor="maxPrice">Max. Prijs</label>
          <input id="maxPrice" name="maxPrice" type="number" min="0" value={currentFilters.maxPrice} onChange={handleChange} placeholder="€ Geen limiet" />
        </div>
      </div>

      <div className="button-group">
        <button type="button" className="btn-secondary" onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? 'Minder filters' : 'Meer filters'}
        </button>

        {showAdvanced && (
          <div className="advanced-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', width: '100%', marginTop: '20px'}}>
            <div className="input-group">
              <label htmlFor="minBedrooms">Slaapkamers</label>
              <input id="minBedrooms" name="minBedrooms" type="number" min="0" value={currentFilters.minBedrooms} onChange={handleChange} placeholder="Aantal" />
            </div>
            <div className="input-group">
              <label htmlFor="minBathrooms">Badkamers</label>
              <input id="minBathrooms" name="minBathrooms" type="number" min="0" value={currentFilters.minBathrooms} onChange={handleChange} placeholder="Aantal" />
            </div>
            <div className="input-group">
              <label htmlFor="minArea">Min. Oppervlakte (m²)</label>
              <input id="minArea" name="minArea" type="number" min="0" value={currentFilters.minArea} onChange={handleChange} placeholder="m²" />
            </div>
            <div className="input-group">
              <label htmlFor="minYear">Min. Bouwjaar</label>
              <input id="minYear" name="minYear" type="number" min="0" value={currentFilters.minYear} onChange={handleChange} placeholder="Jaar" />
            </div>
            <div className="input-group">
              <label htmlFor="hasGarden">Tuin</label>
              <select id="hasGarden" name="hasGarden" value={currentFilters.hasGarden} onChange={handleChange}>
                <option value="">Alle</option>
                <option value="yes">Ja</option>
                <option value="no">Nee</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="hasGarage">Garage</label>
              <select id="hasGarage" name="hasGarage" value={currentFilters.hasGarage} onChange={handleChange}>
                <option value="">Alle</option>
                <option value="yes">Ja</option>
                <option value="no">Nee</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="hasDriveway">Oprit</label>
              <select id="hasDriveway" name="hasDriveway" value={currentFilters.hasDriveway} onChange={handleChange}>
                <option value="">Alle</option>
                <option value="yes">Ja</option>
                <option value="no">Nee</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="hasPool">Zwembad</label>
              <select id="hasPool" name="hasPool" value={currentFilters.hasPool} onChange={handleChange}>
                <option value="">Alle</option>
                <option value="yes">Ja</option>
                <option value="no">Nee</option>
              </select>
            </div>
          </div>
        )}
        
        <button className="btn-primary" type="button" onClick={() => {
          const emptyFilters: Filters = {
            search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '',
            minArea: '', minYear: '', selectedTypeSlug: null, hasGarden: '', 
            hasPool: '', hasGarage: '', hasDriveway: '',
          };
          setCurrentFilters(emptyFilters);
          onFilterChange(emptyFilters);
        }}>Reset Filters</button>
      </div>
    </div>
  );
};

export default FilterForm;