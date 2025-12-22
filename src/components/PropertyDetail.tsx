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

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((photoIndex! + 1) % allImages.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((photoIndex! - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="pd-wrapper">
      <div className="pd-inner">
        <Link to="/" className="pd-back">← Terug naar aanbod</Link>
        <h1 className="pd-title">{property.title.rendered}</h1>

        {/* DE GRID: Harde 50/50 verdeling voor de rechterkant */}
        <div className="pd-gallery">
          <div className="pd-gallery__main" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Hero" referrerPolicy="no-referrer" />
          </div>
          <div className="pd-gallery__side">
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="pd-gallery__thumb" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Thumb" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT: Nooit meer overlap met de afbeeldingen */}
        <div className="pd-content">
          <div className="pd-info-block">
            <section className="pd-section">
              <h2 className="pd-section-title">Basis Kenmerken</h2>
              <div className="pd-stats-grid">
                <div className="pd-stat-item">
                  <span className="label">PRIJS</span>
                  <span className="value">€ {Number(property.acf.price).toLocaleString('nl-NL')}</span>
                </div>
                <div className="pd-stat-item">
                  <span className="label">SLAAPKAMERS</span>
                  <span className="value">{property.acf.bedrooms}</span>
                </div>
                <div className="pd-stat-item">
                  <span className="label">OPPERVLAKTE</span>
                  <span className="value">{property.acf.square_footage} m²</span>
                </div>
                <div className="pd-stat-item">
                  <span className="label">BOUWJAAR</span>
                  <span className="value">{property.acf.construction_year}</span>
                </div>
              </div>
            </section>

            {property.acf.description && (
              <section className="pd-section">
                <h2 className="pd-section-title">Beschrijving</h2>
                <p className="pd-desc-body">{property.acf.description}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* VIEWER: Pijltjes buiten de afbeeldingsflow */}
      {photoIndex !== null && (
        <div className="pd-modal" onClick={() => setPhotoIndex(null)}>
          <button className="pd-modal-close">✕</button>
          
          <button className="pd-modal-nav prev" onClick={prevPhoto}>‹</button>
          
          <div className="pd-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[photoIndex]} alt="Large view" />
            <div className="pd-modal-counter">{photoIndex + 1} / {allImages.length}</div>
          </div>

          <button className="pd-modal-nav next" onClick={nextPhoto}>›</button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;