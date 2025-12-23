import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetail.scss';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  
  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const API_URL = 'https://dev-property-dashboard.pantheonsite.io';
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));
      try {
        const res = await fetch(`${API_URL}/wp-json/wp/v2/property/${id}?_embed`, { headers });
        const data = await res.json();
        setProperty(data);
      } catch (err) { console.error("Detail error", err); }
    };
    fetchProperty();
  }, [id]);

  if (!property || !property.acf) return <div className="pd-loading">Data laden...</div>;

  const acf = property.acf;
  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const gallery: string[] = Array.isArray(acf.property_gallery) ? acf.property_gallery : [];
  
  // Combineer alle foto's in één array voor de lightbox (Hoofdfoto eerst)
  const allImages = featuredImage ? [featuredImage, ...gallery] : gallery;
  const extraCount = gallery.length - 2;

  // Navigatie functies
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allImages.length - 1));
  };

  return (
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug naar overzicht</Link>
        <h1 className="pd-title">{property.title?.rendered}</h1>

        {/* Mosaic Grid */}
        <div className="pd-mosaic-grid">
          {/* Main Image (Index 0) */}
          <div className="pd-main-img" onClick={() => setLightboxIndex(0)}>
            {featuredImage ? (
              <img src={featuredImage} alt="Main" referrerPolicy="no-referrer" />
            ) : (
              <div className="pd-placeholder">Geen foto</div>
            )}
          </div>

          <div className="pd-side-imgs">
            {/* Gallery Image 1 (Index 1) */}
            <div className="pd-side-item" onClick={() => setLightboxIndex(1)}>
              {gallery[0] ? <img src={gallery[0]} alt="G1" /> : <div className="pd-placeholder" />}
            </div>

            {/* Gallery Image 2 (Index 2) */}
            <div className="pd-side-item" onClick={() => setLightboxIndex(2)}>
              {gallery[1] ? (
                <>
                  <img src={gallery[1]} alt="G2" />
                  {extraCount > 0 && <div className="pd-overlay"><span>+{extraCount}</span></div>}
                </>
              ) : (
                <div className="pd-placeholder" />
              )}
            </div>
          </div>
        </div>

        {/* LIGHTBOX OVERLAY */}
        {lightboxIndex !== null && (
          <div className="pd-lightbox" onClick={() => setLightboxIndex(null)}>
            <button className="pd-close">Sluiten</button>
            <button className="pd-arrow prev" onClick={prevImage}>&#10094;</button>
            <div className="pd-view-box">
              <img src={allImages[lightboxIndex]} alt="Full view" />
              <div className="pd-counter">{lightboxIndex + 1} / {allImages.length}</div>
            </div>
            <button className="pd-arrow next" onClick={nextImage}>&#10095;</button>
          </div>
        )}

        <div className="pd-info">
          {/* De rest van je stats... */}
          <div className="pd-stats">
             <div className="pd-stat"><span className="label">PRIJS</span><span className="value">€ {Number(acf.price || 0).toLocaleString('nl-NL')}</span></div>
             <div className="pd-stat"><span className="label">SLAAPKAMERS</span><span className="value">{acf.bedrooms || 0}</span></div>
             <div className="pd-stat"><span className="label">OPPERVLAKTE</span><span className="value">{acf.square_footage || 0} m²</span></div>
          </div>
          <div className="pd-desc">
            <h3>Beschrijving</h3>
            <p>{acf.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;