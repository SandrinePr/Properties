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
  const [photoIndex, setPhotoIndex] = useState<number | null>(null); // Index voor navigatie

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
      <Link to="/" className="property-detail__back">← Terug naar Overzicht</Link>

      <div className="property-detail__card">
        <h1 className="property-detail__title">{property.title.rendered}</h1>

        {/* Klikbare Grid Layout */}
        <div className="funda-grid">
          <div className="funda-grid__main" onClick={() => setPhotoIndex(0)}>
            <img src={allImages[0]} alt="Main" referrerPolicy="no-referrer" />
          </div>
          <div className="funda-grid__side">
            {allImages.slice(1, 5).map((img, idx) => (
              <div key={idx} className="funda-grid__small" onClick={() => setPhotoIndex(idx + 1)}>
                <img src={img} alt="Side" referrerPolicy="no-referrer" />
                {idx === 3 && allImages.length > 5 && (
                  <div className="funda-grid__more">+{allImages.length - 5} foto's</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigeerbare Lightbox */}
        {photoIndex !== null && (
          <div className="full-viewer" onClick={() => setPhotoIndex(null)}>
            <button className="full-viewer__close">✕ Sluiten</button>
            <button className="full-viewer__nav prev" onClick={prevPhoto}>❮</button>
            <div className="full-viewer__container">
              <img src={allImages[photoIndex]} alt="Full view" />
              <div className="full-viewer__counter">{photoIndex + 1} / {allImages.length}</div>
            </div>
            <button className="full-viewer__nav next" onClick={nextPhoto}>❯</button>
          </div>
        )}

        <div className="property-content">
          <section className="property-content__section">
            <h2>Basis Kenmerken</h2>
            <div className="property-content__list">
              <div className="item"><strong>PRIJS</strong>€ {Number(property.acf.price).toLocaleString('nl-NL')}</div>
              <div className="item"><strong>SLAAPKAMERS</strong>{property.acf.bedrooms}</div>
              <div className="item"><strong>OPPERVLAKTE</strong>{property.acf.square_footage} m²</div>
              <div className="item"><strong>BOUWJAAR</strong>{property.acf.construction_year}</div>
            </div>
          </section>

          <section className="property-content__section">
            <h2>Voorzieningen</h2>
            <div className="property-content__tags">
              {property.acf.garden && <span>Tuin ✅</span>}
              {property.acf.pool && <span>Zwembad ✅</span>}
              {property.acf.garage && <span>Garage ✅</span>}
              {property.acf.driveway && <span>Oprit ✅</span>}
            </div>
          </section>

          <section className="property-content__section">
            <h2>Beschrijving</h2>
            <p className="description-text">{property.acf.description}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;