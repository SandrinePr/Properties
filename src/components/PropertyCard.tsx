import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }: { property: any }) => {
  const acf = property.acf || {};
  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <div className="property-card">
      <Link to={`/property/${property.id}`}>
        <div className="image-container">
          {featuredImage ? <img src={featuredImage} alt={property.title.rendered} /> : <div className="placeholder">Geen foto</div>}
        </div>
        <div className="card-content">
          <h3>{property.title.rendered}</h3>
          <p className="price">
            {acf.price ? `€ ${Number(acf.price).toLocaleString('nl-NL')}` : 'Prijs op aanvraag'}
          </p>
          <div className="stats">
            <span>{acf.bedrooms || 0} Slaapkamers</span> • <span>{acf.square_footage || 0} m²</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;