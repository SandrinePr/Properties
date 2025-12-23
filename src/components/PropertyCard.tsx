import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }: { property: any }) => {
    if (!property) return null;

    const title = property.title?.rendered || "Naamloze woning";
    const acf = property.acf || {};
    const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    // Gallery grid
    const gallery: string[] = Array.isArray(acf.property_gallery) ? acf.property_gallery : [];
    const galleryCount = gallery.length;

    // Parseer velden als getal
    let price = acf.price ? Number(acf.price) : null;
    let displayPrice = (price === null || isNaN(price) || price === 0)
        ? "Prijs op aanvraag"
        : `€ ${price.toLocaleString('nl-NL')}`;

    const bedrooms = acf.bedrooms !== undefined && acf.bedrooms !== null && acf.bedrooms !== ''
        ? Number(acf.bedrooms) : <span style={{color:'#bbb'}}>Geen data</span>;
    const bathrooms = acf.bathrooms !== undefined && acf.bathrooms !== null && acf.bathrooms !== ''
        ? Number(acf.bathrooms) : <span style={{color:'#bbb'}}>Geen data</span>;
    const area = acf.square_footage !== undefined && acf.square_footage !== null && acf.square_footage !== ''
        ? Number(acf.square_footage) : <span style={{color:'#bbb'}}>Geen data</span>;

    return (
        <div className="property-card">
            {/* Gallery grid bovenaan */}
            {galleryCount > 0 ? (
                <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(galleryCount, 3)}, 1fr)`, gap: '4px', marginBottom: 8 }}>
                    {gallery.slice(0, 3).map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                            <img src={img} alt={`Gallery ${idx+1}`} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }} />
                            {idx === 2 && galleryCount > 3 && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, borderRadius: 6 }}>
                                    +{galleryCount - 3}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card-image">
                    {featuredImage ? (
                        <img src={featuredImage} alt={title} referrerPolicy="no-referrer" />
                    ) : (
                        <div className="placeholder">Geen afbeelding</div>
                    )}
                </div>
            )}
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
                
                {/* Dynamische lijst van overige ACF velden */}
                <div className="acf-fields" style={{ marginTop: 10, fontSize: '0.95em', color: '#444' }}>
                    {Object.entries(acf).map(([key, value]) => (
                        key !== 'property_gallery' && value !== '' && value !== null && value !== undefined ? (
                            <div key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {typeof value === 'boolean' ? (value ? 'Ja' : 'Nee') : value}</div>
                        ) : null
                    ))}
                </div>

                {!acf || Object.keys(acf).length === 0 ? (
                    <div style={{color:'#bbb', fontSize:'0.95em', marginTop:'8px'}}>Geen extra woningdata beschikbaar</div>
                ) : null}

                <Link to={`/property/${property.id}`}>
                    <button>Bekijk Details</button>
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;