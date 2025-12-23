import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }: { property: any }) => {
    // VEILIGHEID: Crash-proof check
    if (!property || !property.acf) {
        return null; // Toon niks als de data kapot is
    }

    const { title, acf, _embedded } = property;
    const featuredImage = _embedded?.['wp:featuredmedia']?.[0]?.source_url;

    const formatPrice = (priceInput: any) => {
        const price = Number(priceInput);
        return isNaN(price) || price === 0 
            ? "Prijs op aanvraag" 
            : price.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
    };

    return (
        <div className="property-card">
            <div className="card-image-wrapper">
                {featuredImage ? (
                    <img src={featuredImage} alt={title?.rendered} referrerPolicy="no-referrer" />
                ) : (
                    <div className="no-image">Geen afbeelding</div>
                )}
            </div>
            <div className="card-content">
                <Link to={`/property/${property.id}`}>
                    <h3>{title?.rendered || 'Naamloos object'}</h3>       
                </Link>
                <span className="price">{formatPrice(acf.price)}</span>
                <div className="specs">
                    <span>🛏️ {acf.bedrooms || 0}</span>
                    <span>🚿 {acf.bathrooms || 0}</span>
                    <span>📏 {acf.square_footage || 0} m²</span>
                </div>
                <Link to={`/property/${property.id}`}>
                    <button className="btn-view">Bekijk Details</button>
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;