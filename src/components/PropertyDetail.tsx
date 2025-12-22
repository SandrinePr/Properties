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

  // Navigatie logica
  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev! + 1) % allImages.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev! - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="pd-root">
      <div className="pd-inner">
        <Link to="/" className="pd-back">← Terug</Link>
        <h1 className="pd-title">{property.title.rendered}</h1>

        {/* DE GRID: Alleen foto's, geen knoppen. Dit houdt de uitlijning strak */}
        <div className="pd-photo-grid">
          <div className="pd-grid-left" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Hoofdfoto" referrerPolicy="no-referrer" />
          </div>
          <div className="pd-grid-right">
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="pd-grid-thumb" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt={`Detail ${idx + 1}`} referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        <div className="pd-content-card">
          <h2>Basis Kenmerken</h2>
          <div className="pd-stats">
            <div className="pd-stat">
              <span className="label">PRIJS</span>
              <span className="value">€ {Number(property.acf.price).toLocaleString('nl-NL')}</span>
            </div>
            <div className="pd-stat">
              <span className="label">SLAAPKAMERS</span>
              <span className="value">{property.acf.bedrooms}</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEWER OVERLAY: Losgekoppeld van de grid */}
      {photoIndex !== null && (
        <div className="pd-viewer" onClick={() => setPhotoIndex(null)}>
          <button className="pd-close">✕ Sluiten</button>
          
          <button className="pd-nav-arrow prev" onClick={prevPhoto}>‹</button>
          
          <div className="pd-viewer-box" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[photoIndex]} alt="Groot" />
            <div className="pd-counter">{photoIndex + 1} / {allImages.length}</div>
          </div>

          <button className="pd-nav-arrow next" onClick={nextPhoto}>›</button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;