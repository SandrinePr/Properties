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
    <div className="property-detail-page">
      <div className="content-container">
        <Link to="/" className="back-navigation">← Terug naar overzicht</Link>
        <h1 className="property-main-title">{property.title.rendered}</h1>

        {/* Verbeterde Grid: Gebruikt CSS Aspect Ratio voor perfecte uitlijning */}
        <div className="funda-style-grid">
          <div className="funda-style-grid__hero" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Hero" referrerPolicy="no-referrer" />
          </div>
          <div className="funda-style-grid__gallery">
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="funda-style-grid__thumb" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Gallery thumb" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Info sectie: Nu gegarandeerd op de juiste plek */}
        <div className="property-info-sheet">
          <section className="info-block">
            <h2 className="info-block__title">Basis Kenmerken</h2>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-item__label">PRIJS</span>
                <span className="feature-item__value">€ {Number(property.acf.price).toLocaleString('nl-NL')}</span>
              </div>
              <div className="feature-item">
                <span className="feature-item__label">SLAAPKAMERS</span>
                <span className="feature-item__value">{property.acf.bedrooms}</span>
              </div>
              <div className="feature-item">
                <span className="feature-item__label">OPPERVLAKTE</span>
                <span className="feature-item__value">{property.acf.square_footage} m²</span>
              </div>
              <div className="feature-item">
                <span className="feature-item__label">BOUWJAAR</span>
                <span className="feature-item__value">{property.acf.construction_year}</span>
              </div>
            </div>
          </section>

          {property.acf.description && (
            <section className="info-block">
              <h2 className="info-block__title">Beschrijving</h2>
              <p className="property-text-content">{property.acf.description}</p>
            </section>
          )}
        </div>
      </div>

      {/* Lightbox Viewer */}
      {photoIndex !== null && (
        <div className="fullscreen-viewer" onClick={() => setPhotoIndex(null)}>
          <button className="fullscreen-viewer__close">✕ Sluiten</button>
          
          <div className="fullscreen-viewer__inner">
            <button className="nav-arrow prev" onClick={prevPhoto}>‹</button>
            <div className="image-wrapper">
              <img src={allImages[photoIndex]} alt="Large" onClick={(e) => e.stopPropagation()} />
            </div>
            <button className="nav-arrow next" onClick={nextPhoto}>›</button>
          </div>

          <div className="fullscreen-viewer__footer">
            <span className="photo-counter">{photoIndex + 1} / {allImages.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;