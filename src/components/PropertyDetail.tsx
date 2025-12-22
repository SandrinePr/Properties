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
    <div className="funda-layout">
      <div className="funda-container">
        <Link to="/" className="back-link">← Terug naar overzicht</Link>
        <h1 className="main-title">{property.title.rendered}</h1>

        {/* DE GRID: Harde uitlijning op één lijn */}
        <div className="photo-grid">
          <div className="photo-grid__main" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Hero" referrerPolicy="no-referrer" />
          </div>
          <div className="photo-grid__side">
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="photo-grid__thumb" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Detail" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT: Gegarandeerd onder de grid */}
        <div className="info-section">
          <div className="info-card">
            <section className="info-block">
              <h2>Basis Kenmerken</h2>
              <div className="stats-grid">
                <div className="stat">
                  <span className="label">PRIJS</span>
                  <span className="value">€ {Number(property.acf.price).toLocaleString('nl-NL')}</span>
                </div>
                <div className="stat">
                  <span className="label">SLAAPKAMERS</span>
                  <span className="value">{property.acf.bedrooms}</span>
                </div>
                <div className="stat">
                  <span className="label">OPPERVLAKTE</span>
                  <span className="value">{property.acf.square_footage} m²</span>
                </div>
                <div className="stat">
                  <span className="label">BOUWJAAR</span>
                  <span className="value">{property.acf.construction_year}</span>
                </div>
              </div>
            </section>

            {property.acf.description && (
              <section className="info-block">
                <h2>Beschrijving</h2>
                <p className="description">{property.acf.description}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* VIEWER: Zwevende pijltjes die de grid NIET beïnvloeden */}
      {photoIndex !== null && (
        <div className="viewer-overlay" onClick={() => setPhotoIndex(null)}>
          <button className="close-viewer">Sluiten ✕</button>
          
          <button className="nav-arrow prev" onClick={prevPhoto}>‹</button>
          
          <div className="viewer-content" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[photoIndex]} alt="Groot" />
            <div className="counter">{photoIndex + 1} / {allImages.length}</div>
          </div>

          <button className="nav-arrow next" onClick={nextPhoto}>›</button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;