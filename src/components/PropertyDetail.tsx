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

  return (
    <div className="pd-main">
      <div className="pd-container">
        <Link to="/" className="pd-back-link">← Terug naar aanbod</Link>
        <h1 className="pd-title">{property.title.rendered}</h1>

        {/* DE GRID FIX: Alles in één lijn */}
        <div className="pd-image-grid">
          <div className="pd-image-grid__main" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Main" referrerPolicy="no-referrer" />
          </div>
          <div className="pd-image-grid__side">
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="pd-image-grid__thumb" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Thumb" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT SECTIE: Staat gegarandeerd onder de grid */}
        <div className="pd-content">
          <div className="pd-card">
            <section className="pd-section">
              <h2 className="pd-section-title">Basis Kenmerken</h2>
              <div className="pd-stats">
                <div className="pd-stat">
                  <span className="pd-label">PRIJS</span>
                  <span className="pd-value">€ {Number(property.acf.price).toLocaleString('nl-NL')}</span>
                </div>
                <div className="pd-stat">
                  <span className="pd-label">SLAAPKAMERS</span>
                  <span className="pd-value">{property.acf.bedrooms}</span>
                </div>
                <div className="pd-stat">
                  <span className="pd-label">OPPERVLAKTE</span>
                  <span className="pd-value">{property.acf.square_footage} m²</span>
                </div>
                <div className="pd-stat">
                  <span className="pd-label">BOUWJAAR</span>
                  <span className="pd-value">{property.acf.construction_year}</span>
                </div>
              </div>
            </section>

            {property.acf.description && (
              <section className="pd-section">
                <h2 className="pd-section-title">Beschrijving</h2>
                <p className="pd-description">{property.acf.description}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {photoIndex !== null && (
        <div className="pd-lightbox" onClick={() => setPhotoIndex(null)}>
          <button className="pd-close">✕ Sluiten</button>
          <div className="pd-lightbox-content">
            <img src={allImages[photoIndex]} alt="Full" />
            <div className="pd-counter">{photoIndex + 1} / {allImages.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;