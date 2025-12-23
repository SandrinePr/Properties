
import React from 'react';
import { Link } from 'react-router-dom';

const bedIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#2d2d3a" d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10h-2v-2H5v2H3V7Zm2 0v6h14V7H5Zm2 8v2h10v-2H7Z"/></svg>
);
const bathIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#2d2d3a" d="M7 17a5 5 0 0 0 10 0H7Zm-2-2v-2a7 7 0 0 1 14 0v2h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 1 1 0-2h1Zm2-2v2h10v-2a5 5 0 0 0-10 0Z"/></svg>
);
const areaIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="18" height="12" x="3" y="6" fill="#2d2d3a" rx="2"/><path fill="#fff" d="M5 8h14v8H5V8Z"/></svg>
);

const PropertyCard = ({ property }: { property: any }) => {
  const acf = property.acf || {};
  const img = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <div className="property-card">
      <div className="img-box">
        {img ? <img src={img} alt={property.title.rendered} /> : <div className="placeholder">Geen foto</div>}
      </div>
      <div className="info">
        <h3>{property.title.rendered}</h3>
        <p className="price">€ {acf.price ? Number(acf.price).toLocaleString('nl-NL') : '--'}</p>
        <div className="features-row">
          <span title="Slaapkamers">{bedIcon} {acf.bedrooms || 0}</span>
          <span title="Badkamers">{bathIcon} {acf.bathrooms || 0}</span>
          <span title="Oppervlakte">{areaIcon} {acf.square_footage ? `${acf.square_footage} m²` : '--'}</span>
        </div>
        <Link to={`/property/${property.id}`} className="details-btn">
          BEKIJK DETAILS
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;