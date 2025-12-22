import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetail.scss';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://headless-property-wp.local';
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));
      try {
        const res = await fetch(`${API_URL}/wp-json/wp/v2/property/${id}?_embed`, { headers });
        const data = await res.json();
        setProperty(data);
      } catch (err) { console.error(err); }
    };
    fetchProperty();
  }, [id]);

  if (!property) return <div className="loading">Laden...</div>;

  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const gallery = Array.isArray(property.acf.property_gallery) ? property.acf.property_gallery : [];
  const allImages = featuredImage ? [featuredImage, ...gallery.filter(img => img !== featuredImage)] : gallery;

  return (
    <div className="funda-page">
      <div className="funda-container">
        {/* Navigatie */}
        <Link to="/" className="funda-back">← Terug naar aanbod</Link>
        
        {/* Titel */}
        <h1 className="funda-title">{property.title.rendered}</h1>

        {/* DE GRID: Foto's boven, tekst onder */}
        <div className="funda-main-grid">
          
          {/* Foto gedeelte */}
          <div className="funda-photos">
            <div className="funda-photos__hero" onClick={() => setPhotoIndex(0)}>
              <img src={allImages[0]} alt="Main" referrerPolicy="no-referrer" />
            </div>
            <div className="funda-photos__side">
              {allImages.slice(1, 3).map((img, idx) => (
                <div key={idx} className="funda-photos__thumb" onClick={() => setPhotoIndex(idx + 1)}>
                  <img src={img} alt="Thumb" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          {/* Informatie gedeelte: Nu gegarandeerd onder de foto's */}
          <div className="funda-info">
            <div className="funda-card">
              <section className="funda-section">
                <h2>Basis Kenmerken</h2>
                <div className="funda-stats">
                  <div className="funda-stat">
                    <span className="label">PRIJS</span>
                    <span className="value">€ {Number(property.acf.price).toLocaleString('nl-NL')}</span>
                  </div>
                  <div className="funda-stat">
                    <span className="label">SLAAPKAMERS</span>
                    <span className="value">{property.acf.bedrooms}</span>
                  </div>
                  <div className="funda-stat">
                    <span className="label">OPPERVLAKTE</span>
                    <span className="value">{property.acf.square_footage} m²</span>
                  </div>
                  <div className="funda-stat">
                    <span className="label">BOUWJAAR</span>
                    <span className="value">{property.acf.construction_year}</span>
                  </div>
                </div>
              </section>

              {property.acf.description && (
                <section className="funda-section">
                  <h2>Beschrijving</h2>
                  <p className="description-text">{property.acf.description}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {photoIndex !== null && (
        <div className="funda-viewer" onClick={() => setPhotoIndex(null)}>
          <button className="close-btn">Sluiten ✕</button>
          <div className="viewer-content">
            <img src={allImages[photoIndex]} alt="Full" />
            <div className="counter">{photoIndex + 1} / {allImages.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;