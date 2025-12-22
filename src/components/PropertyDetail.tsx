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
    setPhotoIndex((prev) => (prev !== null ? (prev + 1) % allImages.length : 0));
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev !== null ? (prev - 1 + allImages.length) % allImages.length : 0));
  };

  return (
    <div className="pd-page">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug naar aanbod</Link>
        <h1 className="pd-title">{property.title.rendered}</h1>

        {/* DE GRID: Harde 2-koloms layout */}
        <div className="pd-image-grid">
          <div className="pd-main-img" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Hoofdfoto" referrerPolicy="no-referrer" />
          </div>
          <div className="pd-side-imgs">
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="pd-thumb-wrapper" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt={`Detail ${idx + 1}`} referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT: Staat gegarandeerd onder de grid */}
        <div className="pd-content">
          <div className="pd-card">
            <section className="pd-section">
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
                <div className="pd-stat">
                  <span className="label">OPPERVLAKTE</span>
                  <span className="value">{property.acf.square_footage} m²</span>
                </div>
                <div className="pd-stat">
                  <span className="label">BOUWJAAR</span>
                  <span className="value">{property.acf.construction_year}</span>
                </div>
              </div>
            </section>

            {property.acf.description && (
              <section className="pd-section">
                <h2>Beschrijving</h2>
                <p className="pd-description-text">{property.acf.description}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX: Met werkende pijltjes, los van de grid */}
      {photoIndex !== null && (
        <div className="pd-lightbox" onClick={() => setPhotoIndex(null)}>
          <button className="pd-close-btn">✕ Sluiten</button>
          
          <button className="pd-nav-arrow prev" onClick={prevPhoto}>‹</button>
          
          <div className="pd-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[photoIndex]} alt="Vergroting" />
            <div className="pd-counter">{photoIndex + 1} / {allImages.length}</div>
          </div>

          <button className="pd-nav-arrow next" onClick={nextPhoto}>›</button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;