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
    <div className="property-page">
      <div className="property-container">
        <Link to="/" className="back-link">← Terug naar aanbod</Link>
        <h1 className="main-title">{property.title.rendered}</h1>

        {/* Nieuwe Grid-structuur: Geen vaste hoogte om zoom te voorkomen */}
        <div className="media-grid">
          <div className="media-grid__primary" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Hero" referrerPolicy="no-referrer" />
          </div>
          <div className="media-grid__secondary">
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="media-grid__thumb" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Detail" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Info-sectie: Expliciet gescheiden om overlap te voorkomen */}
        <div className="info-wrap">
          <section className="info-section">
            <h2 className="info-section__heading">Basis Kenmerken</h2>
            <div className="stats-row">
              <div className="stat-item">
                <span className="label">PRIJS</span>
                <span className="value">€ {Number(property.acf.price).toLocaleString('nl-NL')}</span>
              </div>
              <div className="stat-item">
                <span className="label">SLAAPKAMERS</span>
                <span className="value">{property.acf.bedrooms}</span>
              </div>
              <div className="stat-item">
                <span className="label">OPPERVLAKTE</span>
                <span className="value">{property.acf.square_footage} m²</span>
              </div>
              <div className="stat-item">
                <span className="label">BOUWJAAR</span>
                <span className="value">{property.acf.construction_year}</span>
              </div>
            </div>
          </section>

          {property.acf.description && (
            <section className="info-section">
              <h2 className="info-section__heading">Beschrijving</h2>
              <p className="description-body">{property.acf.description}</p>
            </section>
          )}
        </div>
      </div>

      {/* Lightbox: De tekst staat nu in een aparte footer-balk onder het beeld */}
      {photoIndex !== null && (
        <div className="overlay-viewer" onClick={() => setPhotoIndex(null)}>
          <button className="overlay-viewer__close">✕</button>
          
          <div className="overlay-viewer__stage">
            <button className="nav-btn prev" onClick={prevPhoto}>‹</button>
            <div className="image-holder">
              <img src={allImages[photoIndex]} alt="Zoom" onClick={(e) => e.stopPropagation()} />
            </div>
            <button className="nav-btn next" onClick={nextPhoto}>›</button>
          </div>

          <div className="overlay-viewer__footer">
            <div className="counter-pill">{photoIndex + 1} / {allImages.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;