import React from 'react';
import { Link } from 'react-router-dom';


const PropertyCard = ({ property }: { property: any }) => {
    if (!property) return null;

    const title = property.title?.rendered || "Naamloze woning";
    const acf = property.acf || null;
    const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;


    // Parseer velden als getal
    let price = acf && acf.price ? Number(acf.price) : null;
    let displayPrice = (price === null || isNaN(price) || price === 0)
        ? "Prijs op aanvraag"
        : `€ ${price.toLocaleString('nl-NL')}`;

    const bedrooms = acf && acf.bedrooms !== undefined && acf.bedrooms !== null && acf.bedrooms !== ''
        ? Number(acf.bedrooms)
        : <span style={{color:'#bbb'}}>Geen data</span>;
    const bathrooms = acf && acf.bathrooms !== undefined && acf.bathrooms !== null && acf.bathrooms !== ''
        ? Number(acf.bathrooms)
        : <span style={{color:'#bbb'}}>Geen data</span>;
    const area = acf && acf.square_footage !== undefined && acf.square_footage !== null && acf.square_footage !== ''
        ? Number(acf.square_footage)
        : <span style={{color:'#bbb'}}>Geen data</span>;

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
                    <span title="Slaapkamers">🛏️ {bedrooms}</span>
                    <span title="Badkamers">🛁 {bathrooms}</span>
                    <span title="Oppervlakte">📏 {area} m²</span>
                </div>
                {!acf && (
                    <div style={{color:'#bbb', fontSize:'0.95em', marginTop:'8px'}}>Geen extra woningdata beschikbaar</div>
                )}
                <Link to={`/property/${property.id}`}>
                    <button>Bekijk Details</button>
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;