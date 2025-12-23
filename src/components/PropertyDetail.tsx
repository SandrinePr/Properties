import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetail.scss';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const API_URL = 'https://dev-property-dashboard.pantheonsite.io';
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));
      try {
        const res = await fetch(`${API_URL}/wp-json/wp/v2/property/${id}?_embed`, { headers });
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        console.error("Detail Error:", err);
      }
    };
    fetchProperty();
  }, [id]);

  // VEILIGHEID: Check of acf bestaat
  if (!property || !property.acf) {
    return <div className="pd-loading">Woninggegevens laden...</div>;
  }

  const acf = property.acf;
  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  
  // Gallery logica
  const gallery = Array.isArray(acf.property_gallery) ? acf.property_gallery : [];
  const allImages = featuredImage ? [featuredImage, ...gallery.filter((img: any) => img !== featuredImage)] : gallery;

  return (
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug naar overzicht</Link>
        <h1 className="pd-title">{property.title?.rendered}</h1>

        <div className="pd-grid-wrapper">
          <div className="pd-grid-main" onClick={() => setPhotoIndex(0)}>
            {allImages[0] ? <img src={allImages[0]} alt="Main" referrerPolicy="no-referrer" /> : <div className="pd-placeholder">Geen foto</div>}
          </div>
          
          <div className="pd-grid-side">
            <div className="pd-side-item" onClick={() => setPhotoIndex(1)}>
              {allImages[1] ? <img src={allImages[1]} alt="Side 1" referrerPolicy="no-referrer" /> : <div className="pd-placeholder"></div>}
            </div>
            <div className="pd-side-item" onClick={() => setPhotoIndex(2)}>
              {allImages[2] ? <img src={allImages[2]} alt="Side 2" referrerPolicy="no-referrer" /> : <div className="pd-placeholder"></div>}
              {allImages.length > 3 && (
                <div className="pd-image-badge">
                  <span>+{allImages.length - 2} foto's</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pd-info-card">
          <h2 className="pd-section-title">Kenmerken</h2>
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
              <span className="label">OPPERVLAKTE</span>
              <span className="value">{acf.square_footage || 0} m²</span>
            </div>
            <div className="pd-stat">
              <span className="label">BOUWJAAR</span>
              <span className="value">{acf.construction_year || 'Onbekend'}</span>
            </div>
          </div>
          <div className="pd-description-content" style={{marginTop: '30px', textAlign: 'left'}}>
             <p>{acf.description}</p>
          </div>
        </div>
      </div>

      {photoIndex !== null && (
        <div className="pd-overlay" onClick={() => setPhotoIndex(null)}>
          <button className="pd-close">✕ Sluiten</button>
          <button className="pd-arrow prev" onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex - 1 + allImages.length) % allImages.length); }}>‹</button>
          <div className="pd-view-box" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[photoIndex]} alt="Fullscreen" />
            <div className="pd-counter">{photoIndex + 1} / {allImages.length}</div>
          </div>
          <button className="pd-arrow next" onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex + 1) % allImages.length); }}>›</button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;