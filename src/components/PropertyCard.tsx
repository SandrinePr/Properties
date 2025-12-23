import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }: { property: any }) => {
  const acf = property.acf || {};
  const img = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <div className="property-card">
      <Link to={`/property/${property.id}`}>
        <div className="img-box">
          {img ? <img src={img} alt="" /> : <div className="placeholder">Geen foto</div>}
        </div>
        <div className="info">
          <h3>{property.title.rendered}</h3>
          <p className="price">€ {Number(acf.price).toLocaleString()}</p>
          <div className="tags">
            <span>{acf.bedrooms} beds</span>
            <span>{acf.square_footage} m²</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;