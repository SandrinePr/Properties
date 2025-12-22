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
      } catch (err) {
        console.error("Fout bij ophalen property:", err);
      }
    };
    fetchProperty();
  }, [id]);

  if (!property) return <div className="loading">Laden...</div>;

  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const gallery = Array.isArray(property.acf.property_gallery) ? property.acf.property_gallery : [];
  const allImages = featuredImage ? [featuredImage, ...gallery.filter(img => img !== featuredImage)] : gallery;

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((photoIndex! + 1) % allImages.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((photoIndex! - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* Navigatie bovenop */}
        <header className="pd-header">
          <Link to="/" className="pd-back-link">← Terug naar aanbod</Link>
          <h1 className="pd-title">{property.title.rendered}</h1>
        </header>

        {/* Sectie 1: Foto Grid */}
        <div className="pd-media-section">
          <div className="pd-grid">
            <div className="pd-grid__main" onClick={() => setPhotoIndex(0)}>
              <img src={allImages[0]} alt="Hoofdfoto" referrerPolicy="no-referrer" />
            </div>
            <div className="pd-grid__side">
              {allImages.slice(1, 3).map((img, idx) => (
                <div key={idx} className="pd-grid__thumb" onClick={() => setPhotoIndex(idx + 1)}>
                  <img src={img} alt={`Detail ${idx + 1}`} referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sectie 2: De tekstkaart (Gegarandeerd onder de grid) */}
        <main className="pd-content-section">
          <div className="pd-card">
            <section className="pd-info-block">
              <h2 className="pd-info-block__title">Basis Kenmerken</h2>
              <div className="pd-stats">
                <div className="pd-stat">
                  <span className="pd-stat__label">PRIJS</span>
                  <span className="pd-stat__value">€ {Number(property.acf.price).toLocaleString('nl-NL')}</span>
                </div>
                <div className="pd-stat">
                  <span className="pd-stat__label">SLAAPKAMERS</span>
                  <span className="pd-stat__value">{property.acf.bedrooms}</span>
                </div>
                <div className="pd-stat">
                  <span className="pd-stat__label">OPPERVLAKTE</span>
                  <span className="pd-stat__value">{property.acf.square_footage} m²</span>
                </div>
                <div className="pd-stat">
                  <span className="pd-stat__label">BOUWJAAR</span>
                  <span className="pd-stat__value">{property.acf.construction_year}</span>
                </div>
              </div>
            </section>

            {property.acf.description && (
              <section className="pd-info-block">
                <h2 className="pd-info-block__title">Beschrijving</h2>
                <p className="pd-description">{property.acf.description}</p>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Lightbox Viewer */}
      {photoIndex !== null && (
        <div className="pd-viewer" onClick={() => setPhotoIndex(null)}>
          <button className="pd-viewer__close">✕ Sluiten</button>
          
          <div className="pd-viewer__stage">
            <button className="pd-viewer__arrow" onClick={prevPhoto}>‹</button>
            <div className="pd-viewer__img-container" onClick={(e) => e.stopPropagation()}>
              <img src={allImages[photoIndex]} alt="Groot" />
              <div className="pd-viewer__counter">
                {photoIndex + 1} / {allImages.length}
              </div>
            </div>
            <button className="pd-viewer__arrow" onClick={nextPhoto}>›</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;