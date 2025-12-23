import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }: { property: any }) => {
    // Als de woning geen data heeft, toon niks in plaats van te crashen
    if (!property || !property.acf) return null;

    const { title, acf, _embedded } = property;
    const featuredImage = _embedded?.['wp:featuredmedia']?.[0]?.source_url;

    // Prijs veilig verwerken
    const price = Number(acf.price);
    const formattedPrice = !isNaN(price) && price > 0 
        ? price.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })
        : "Prijs op aanvraag";

    return (
        <div className="property-card">
            <div className="card-image-box">
                {featuredImage ? (
                    <img src={featuredImage} alt={title?.rendered} referrerPolicy="no-referrer" />
                ) : (
                    <div className="placeholder-img">Geen afbeelding</div>
                )}
            </div>
            <div className="card-content">
                <Link to={`/property/${property.id}`}>
                    <h3>{title?.rendered || "Naamloos object"}</h3>       
                </Link>
                <span className="price-tag">{formattedPrice}</span>
                <div className="card-specs">
                    <span>🛏️ {acf.bedrooms || 0}</span>
                    <span>🚿 {acf.bathrooms || 0}</span>
                    <span>📏 {acf.square_footage || 0} m²</span>
                </div>
                <Link to={`/property/${property.id}`}>
                    <button className="view-btn">Bekijk Details</button>
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;