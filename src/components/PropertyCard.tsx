import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }: { property: any }) => {
    // Cruciaal: als acf mist, stop hier
    if (!property || !property.acf) return null;

    const { title, acf, _embedded } = property;
    const featuredImage = _embedded?.['wp:featuredmedia']?.[0]?.source_url;

    const price = Number(acf.price);
    const displayPrice = isNaN(price) || price === 0 
        ? "Prijs op aanvraag" 
        : price.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });

    return (
        <div className="property-card">
            <div className="card-image">
                {featuredImage && <img src={featuredImage} alt={title?.rendered} referrerPolicy="no-referrer" />}
            </div>
            <div className="card-content">
                <Link to={`/property/${property.id}`}>
                    <h3>{title?.rendered || 'Naamloos object'}</h3>       
                </Link>
                <span className="price">{displayPrice}</span>
                <div className="specs">
                    <span>🛏️ {acf.bedrooms || 0}</span>
                    <span>🚿 {acf.bathrooms || 0}</span>
                    <span>📏 {acf.square_footage || 0} m²</span>
                </div>
                <Link to={`/property/${property.id}`}>
                    <button className="btn-main">Bekijk Details</button>
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;