import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetail.scss';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const API_URL = 'https://dev-property-dashboard.pantheonsite.io';
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));
      try {
        const res = await fetch(`${API_URL}/wp-json/wp/v2/property/${id}?_embed`, { headers });
        const data = await res.json();
        setProperty(data);
      } catch (err) { console.error("Detail error", err); }
    };
    fetchProperty();
  }, [id]);

  if (!property || !property.acf) return <div className="pd-loading">Data laden...</div>;

  const acf = property.acf;
  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const gallery: string[] = Array.isArray(acf.property_gallery) ? acf.property_gallery : [];
  const galleryCount = gallery.length;

  return (
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug</Link>
        <h1 className="pd-title">{property.title?.rendered}</h1>

        {/* Gallery grid bovenaan */}
        {galleryCount > 0 ? (
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(galleryCount, 3)}, 1fr)`, gap: '8px', marginBottom: 16 }}>
            {gallery.slice(0, 3).map((img, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img src={img} alt={`Gallery ${idx+1}`} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }} />
                {idx === 2 && galleryCount > 3 && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, borderRadius: 8 }}>
                    +{galleryCount - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="pd-hero">
            {featuredImage && <img src={featuredImage} alt="Property" referrerPolicy="no-referrer" />}
          </div>
        )}

        <div className="pd-info">
          <div className="pd-stats">
            <div className="pd-stat">
              <span className="label">PRIJS</span>
              <span className="value">€ {Number(acf.price || 0).toLocaleString('nl-NL')}</span>
            </div>
            <div className="pd-stat">
              <span className="label">SLAAPKAMERS</span>
              <span className="value">{acf.bedrooms || 0}</span>
            </div>
            <div className="pd-stat">
              <span className="label">BADKAMERS</span>
              <span className="value">{acf.bathrooms || 0}</span>
            </div>
            <div className="pd-stat">
              <span className="label">OPPERVLAKTE</span>
              <span className="value">{acf.square_footage || 0} m²</span>
            </div>
            <div className="pd-stat">
              <span className="label">BOUWJAAR</span>
              <span className="value">{acf.construction_year || '-'}</span>
            </div>
            <div className="pd-stat">
              <span className="label">TUIN</span>
              <span className="value">{acf.garden ? 'Ja' : 'Nee'}</span>
            </div>
            <div className="pd-stat">
              <span className="label">GARAGE</span>
              <span className="value">{acf.garage ? 'Ja' : 'Nee'}</span>
            </div>
            <div className="pd-stat">
              <span className="label">Oprit</span>
              <span className="value">{acf.driveway ? 'Ja' : 'Nee'}</span>
            </div>
            <div className="pd-stat">
              <span className="label">ZWEMBAD</span>
              <span className="value">{acf.pool ? 'Ja' : 'Nee'}</span>
            </div>
          </div>
          <div className="pd-desc">
            <p>{acf.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;