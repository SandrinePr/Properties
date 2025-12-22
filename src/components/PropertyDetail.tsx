import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetail.scss';

interface PropertyDetailData {
  id: number;
  title: { rendered: string };
  acf: {
    price: string;
    bedrooms: string;
    bathrooms: string;
    square_footage: string;
    garden: boolean;
    pool: boolean;
    garage: boolean;
    driveway: boolean;
    construction_year: string;
    description?: string;
    property_gallery: string[] | false;
  };
  _embedded?: {
    'wp:featuredmedia'?: [{ source_url: string }];
  };
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyDetailData | null>(null);
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
    if (photoIndex !== null) setPhotoIndex((photoIndex + 1) % allImages.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex !== null) setPhotoIndex((photoIndex - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="property-detail">
      <div className="property-detail__container">
        <Link to="/" className="property-detail__back">← Terug naar Overzicht</Link>
        
        <h1 className="property-detail__title">{property.title.rendered}</h1>

        {/* Grid Sectie - Strikt gescheiden van tekst */}
        <div className="property-grid">
          <div className="property-grid__main" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Hero" referrerPolicy="no-referrer" />
          </div>
          <div className="property-grid__side">
            {allImages.slice(1, 4).map((img, idx) => (
              <div key={idx} className="property-grid__item" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Detail" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Informatie Sectie - Nu gegarandeerd onder de grid */}
        <div className="property-content">
          <section className="property-section">
            <h2 className="property-section__title">Basis Kenmerken</h2>
            <div className="property-stats">
              <div className="stat-box">
                <span className="stat-label">PRIJS</span>
                <span className="stat-value">€ {Number(property.acf.price).toLocaleString('nl-NL')}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">SLAAPKAMERS</span>
                <span className="stat-value">{property.acf.bedrooms}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">OPPERVLAKTE</span>
                <span className="stat-value">{property.acf.square_footage} m²</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">BOUWJAAR</span>
                <span className="stat-value">{property.acf.construction_year}</span>
              </div>
            </div>
          </section>

          {property.acf.description && (
            <section className="property-section">
              <h2 className="property-section__title">Beschrijving</h2>
              <p className="property-description">{property.acf.description}</p>
            </section>
          )}
        </div>
      </div>

      {/* Lightbox Overlay - Alleen zichtbaar bij klik */}
      {photoIndex !== null && (
        <div className="lightbox" onClick={() => setPhotoIndex(null)}>
          <button className="lightbox__close">✕ Sluiten</button>
          
          <button className="lightbox__arrow prev" onClick={prevPhoto}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <div className="lightbox__content">
            <img src={allImages[photoIndex]} alt="Large view" onClick={(e) => e.stopPropagation()} />
            <div className="lightbox__counter">{photoIndex + 1} / {allImages.length}</div>
          </div>

          <button className="lightbox__arrow next" onClick={nextPhoto}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;