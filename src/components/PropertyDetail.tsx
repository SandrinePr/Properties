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
      } catch (err) { console.error("Fetch error:", err); }
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
      <Link to="/" className="property-detail__back">← Terug naar Overzicht</Link>

      <div className="property-detail__card">
        <h1 className="property-detail__title">{property.title.rendered}</h1>

        {/* Grid: Full width per item, geclipt op hoogte */}
        <div className="funda-grid">
          <div className="funda-grid__main" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Main" referrerPolicy="no-referrer" />
          </div>
          <div className="funda-grid__side">
            {allImages.slice(1, 4).map((img, idx) => (
              <div key={idx} className="funda-grid__item" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Side" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox met tekst gegarandeerd ONDER de foto */}
        {photoIndex !== null && (
          <div className="modern-viewer" onClick={() => setPhotoIndex(null)}>
            <button className="modern-viewer__close">✕ Sluiten</button>
            
            <button className="modern-viewer__arrow prev" onClick={prevPhoto}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            <div className="modern-viewer__layout" onClick={(e) => e.stopPropagation()}>
              <div className="modern-viewer__image-box">
                <img src={allImages[photoIndex]} alt="Full view" />
              </div>
              <div className="modern-viewer__caption">
                <div className="modern-viewer__counter">{photoIndex + 1} / {allImages.length}</div>
              </div>
            </div>

            <button className="modern-viewer__arrow next" onClick={nextPhoto}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6" transform="rotate(180 12 12)"/></svg>
            </button>
          </div>
        )}

        <div className="property-info-full">
          <section className="property-info-full__section">
            <h2>Basis Kenmerken</h2>
            <div className="property-info-full__grid">
              <div className="data-box"><strong>PRIJS</strong>€ {Number(property.acf.price).toLocaleString('nl-NL')}</div>
              <div className="data-box"><strong>SLAAPKAMERS</strong>{property.acf.bedrooms}</div>
              <div className="data-box"><strong>OPPERVLAKTE</strong>{property.acf.square_footage} m²</div>
              <div className="data-box"><strong>BOUWJAAR</strong>{property.acf.construction_year}</div>
            </div>
          </section>

          {property.acf.description && (
            <section className="property-info-full__section">
              <h2>Beschrijving</h2>
              <p className="description-text">{property.acf.description}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;