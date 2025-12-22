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

  if (!property) return <div>Laden...</div>;

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
        <Link to="/" className="pd-back">← Terug</Link>
        <h1 className="pd-title">{property.title.rendered}</h1>

        {/* DE GRID: Alleen foto's, geen knoppen hierbinnen */}
        <div className="pd-grid">
          <div className="pd-grid-main" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Main" referrerPolicy="no-referrer" />
          </div>
          <div className="pd-grid-side">
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="pd-thumb" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Thumb" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        <div className="pd-card">
          <h2>Basis Kenmerken</h2>
          <div className="pd-stats">
            <div className="pd-stat"><span>PRIJS</span><strong>€ {Number(property.acf.price).toLocaleString('nl-NL')}</strong></div>
            <div className="pd-stat"><span>M²</span><strong>{property.acf.square_footage}</strong></div>
          </div>
        </div>
      </div>

      {/* DE VIEWER: De pijltjes staan hier 'fixed' zodat ze de grid niet raken */}
      {photoIndex !== null && (
        <div className="pd-overlay" onClick={() => setPhotoIndex(null)}>
          <button className="pd-arrow left" onClick={prevPhoto}>‹</button>
          <div className="pd-viewer-img" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[photoIndex]} alt="Large" />
          </div>
          <button className="pd-arrow right" onClick={nextPhoto}>›</button>
          <button className="pd-close">Sluiten ✕</button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;