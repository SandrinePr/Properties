import React from 'react';
import { Link } from 'react-router-dom';


const PropertyCard = ({ property }: { property: any }) => {
    if (!property) return null;

    const title = property.title?.rendered || "Naamloze woning";
    const acf = property.acf || {};
    const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    const price = Number(acf.price);
    const displayPrice = isNaN(price) || price === 0 
        ? "Prijs op aanvraag" 
        : `€ ${price.toLocaleString('nl-NL')}`;

    return (
        <div className="property-card">
            <div className="card-image">
                {featuredImage ? (
                    <img src={featuredImage} alt={title} referrerPolicy="no-referrer" />
                ) : (
                    <div className="placeholder">Geen afbeelding</div>
                )}
            </div>
            <div className="card-content">
                <Link to={`/property/${property.id}`}>
                    <h3>{title}</h3>       
                </Link>
                <p className="price">{displayPrice}</p>
                <div className="specs">
                    <span title="Slaapkamers">🛏️ {acf.bedrooms ?? '-'}</span>
                    <span title="Badkamers">🛁 {acf.bathrooms ?? '-'}</span>
                    <span title="Oppervlakte">📏 {acf.square_footage ?? '-'} m²</span>
                </div>
                <Link to={`/property/${property.id}`}>
                    <button>Bekijk Details</button>
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;