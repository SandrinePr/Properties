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

  if (!property) return <div className="pd-loading">Laden...</div>;

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
    <div className="pd-main">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug naar aanbod</Link>
        <h1 className="pd-title">{property.title.rendered}</h1>

        {/* DE GRID: Harde uitlijning op één lijn */}
        <div className="pd-image-section">
          <div className="pd-main-img" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Main" referrerPolicy="no-referrer" />
          </div>
          <div className="pd-side-imgs">
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="pd-thumb-wrapper" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT: Gegarandeerd onder de grid */}
        <div className="pd-content-area">
          <div className="pd-info-card">
            <section className="pd-card-section">
              <h2 className="pd-section-h2">Basis Kenmerken</h2>
              <div className="pd-stats-row">
                <div className="pd-stat-box">
                  <span className="pd-label">PRIJS</span>
                  <span className="pd-value">€ {Number(property.acf.price).toLocaleString('nl-NL')}</span>
                </div>
                <div className="pd-stat-box">
                  <span className="pd-label">SLAAPKAMERS</span>
                  <span className="pd-value">{property.acf.bedrooms}</span>
                </div>
                <div className="pd-stat-box">
                  <span className="pd-label">OPPERVLAKTE</span>
                  <span className="pd-value">{property.acf.square_footage} m²</span>
                </div>
                <div className="pd-stat-box">
                  <span className="pd-label">BOUWJAAR</span>
                  <span className="pd-value">{property.acf.construction_year}</span>
                </div>
              </div>
            </section>

            {property.acf.description && (
              <section className="pd-card-section">
                <h2 className="pd-section-h2">Beschrijving</h2>
                <p className="pd-desc-text">{property.acf.description}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* VIEWER: Met gefixeerde pijltjes */}
      {photoIndex !== null && (
        <div className="pd-overlay" onClick={() => setPhotoIndex(null)}>
          <button className="pd-overlay-close">✕</button>
          
          <div className="pd-viewer-box" onClick={(e) => e.stopPropagation()}>
            <button className="pd-nav-arrow left" onClick={prevPhoto}>‹</button>
            
            <div className="pd-img-holder">
              <img src={allImages[photoIndex]} alt="Large" />
              <div className="pd-img-counter">{photoIndex + 1} / {allImages.length}</div>
            </div>

            <button className="pd-nav-arrow right" onClick={nextPhoto}>›</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;