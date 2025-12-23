import React from 'react';

export interface Filters {
  search: string; minPrice: string; maxPrice: string; minBedrooms: string;
  minBathrooms: string; selectedTypeSlug: string | null;
  hasGarden: string; hasPool: string; hasGarage: string; hasDriveway: string;
}

const FilterForm = ({ onFilterChange }: { onFilterChange: (f: Filters) => void }) => {
  const [f, setF] = React.useState<Filters>({
    search: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: '',
    selectedTypeSlug: null, hasGarden: '', hasPool: '', hasGarage: '', hasDriveway: '',
  });

  const update = (e: any) => {
    const next = { ...f, [e.target.name]: e.target.value };
    setF(next);
    onFilterChange(next);
  };

  return (
    <div className="filter-form">
      <input name="search" placeholder="Zoek op naam..." onChange={update} />
      <div className="filter-row">
        <input name="minPrice" placeholder="Min €" type="number" onChange={update} />
        <input name="maxPrice" placeholder="Max €" type="number" onChange={update} />
        <select name="hasGarden" onChange={update}>
          <option value="">Tuin?</option>
          <option value="yes">Ja</option>
          <option value="no">Nee</option>
        </select>
        <select name="hasPool" onChange={update}>
          <option value="">Zwembad?</option>
          <option value="yes">Ja</option>
        </select>
      </div>
    </div>
  );
};

export default FilterForm;