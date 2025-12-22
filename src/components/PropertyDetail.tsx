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
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug</Link>
        <h1 className="pd-title">{property.title.rendered}</h1>

        {/* DE GRID SECTIE */}
        <div className="pd-grid-wrapper">
          <div className="pd-grid-main" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Hero" referrerPolicy="no-referrer" />
          </div>
          <div className="pd-grid-side">
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="pd-side-item" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Thumb" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* DETAILS KAART */}
        <div className="pd-info-card">
          <h2>Basis Kenmerken</h2>
          <div className="pd-stats">
            <div className="pd-stat"><span>PRIJS</span><strong>€ {Number(property.acf.price).toLocaleString('nl-NL')}</strong></div>
            <div className="pd-stat"><span>M²</span><strong>{property.acf.square_footage}</strong></div>
          </div>
        </div>
      </div>

      {/* VIEWER OVERLAY MET PIJLTJES */}
      {photoIndex !== null && (
        <div className="pd-overlay" onClick={() => setPhotoIndex(null)}>
          <button className="pd-arrow prev" onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex - 1 + allImages.length) % allImages.length); }}>‹</button>
          <div className="pd-view-content" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[photoIndex]} alt="Large view" />
          </div>
          <button className="pd-arrow next" onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex + 1) % allImages.length); }}>›</button>
          <button className="pd-close">✕</button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;