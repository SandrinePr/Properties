import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }: { property: any }) => {
    // Als er echt geen data is, toon een foutmelding kaart
    if (!property) return null;

    const title = property.title?.rendered || "Naamloze woning";
    const acf = property.acf || {};
    
    // Probeer de afbeelding te vinden, anders een grijze box
    const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    return (
        <div className="property-card" style={{ border: '1px solid #ccc', marginBottom: '20px', padding: '10px' }}>
            <div className="card-image" style={{ background: '#eee', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {featuredImage ? (
                    <img src={featuredImage} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                ) : (
                    <span>Geen afbeelding</span>
                )}
            </div>
            <div className="card-content">
                <Link to={`/property/${property.id}`}>
                    <h3 style={{ margin: '10px 0' }}>{title}</h3>       
                </Link>
                <p className="price" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {acf.price ? `€ ${Number(acf.price).toLocaleString('nl-NL')}` : "Prijs op aanvraag"}
                </p>
                <div className="specs" style={{ display: 'flex', gap: '10px', color: '#666' }}>
                    <span>🛏️ {acf.bedrooms || '?'}</span>
                    <span>📏 {acf.square_footage || '?'} m²</span>
                </div>
                <Link to={`/property/${property.id}`}>
                    <button style={{ marginTop: '10px', width: '100%', padding: '10px', cursor: 'pointer' }}>Bekijk Details</button>
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;