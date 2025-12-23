import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetail.scss';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      // Gebruik de variabele van Render of je Pantheon URL
      const API_URL = import.meta.env.VITE_API_URL || 'https://dev-property-dashboard.pantheonsite.io';
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));
      
      try {
        const res = await fetch(`${API_URL}/wp-json/wp/v2/property/${id}?_embed`, { headers });
        const data = await res.json();
        setProperty(data);
      } catch (err) { 
        console.error("Data ophaalfout:", err); 
      }
    };
    fetchProperty();
  }, [id]);

  // Toon laadscherm zolang de data er nog niet is
  if (!property) return <div className="pd-loading">Woninggegevens laden...</div>;

  // VEILIGHEID: Gebruik optionele chaining (?.) voor alle WordPress-velden
  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const rawGallery = property.acf?.property_gallery;
  const gallery = Array.isArray(rawGallery) ? rawGallery : [];
  
  const allImages = featuredImage 
    ? [featuredImage, ...gallery.filter((img: any) => img !== featuredImage)] 
    : gallery;

  const category = property._embedded?.['wp:term']?.[0]?.[0]?.name;

  return (
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug naar overzicht</Link>
        
        {category && <span className="pd-category-label">{category}</span>}
        
        <h1 className="pd-title">{property.title?.rendered || 'Naamloos object'}</h1>

        <div className="pd-grid-wrapper">
          <div className="pd-grid-main" onClick={() => setPhotoIndex(0)}>
            {allImages[0] ? (
              <img src={allImages[0]} alt="Hoofdfoto" referrerPolicy="no-referrer" />
            ) : (
              <div className="pd-placeholder">Geen foto beschikbaar</div>
            )}
          </div>
          
          <div className="pd-grid-side">
            <div className="pd-side-item" onClick={() => setPhotoIndex(1)}>
              {allImages[1] && <img src={allImages[1]} alt="Detail 1" referrerPolicy="no-referrer" />}
            </div>
            
            <div className="pd-side-item" onClick={() => setPhotoIndex(2)}>
              {allImages[2] && <img src={allImages[2]} alt="Detail 2" referrerPolicy="no-referrer" />}
              {allImages.length > 3 && (
                <div className="pd-image-badge">
                  <span>+{allImages.length - 2} foto's</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pd-info-card">
          <h2 className="pd-section-title">Kenmerken</h2>
          <div className="pd-stats">
            <div className="pd-stat">
              <span className="label">VRAAGPRIJS</span>
              <span className="value">
                {/* DE FIX: De app crasht niet meer als 'price' mist door gebruik van ?. */}
                {property.acf?.price 
                  ? `€ ${Number(property.acf.price).toLocaleString('nl-NL')}` 
                  : 'Op aanvraag'}
              </span>
            </div>
            <div className="pd-stat">
              <span className="label">OPPERVLAKTE</span>
              <span className="value">{property.acf?.square_footage || '-'} m²</span>
            </div>
            <div className="pd-stat">
              <span className="label">SLAAPKAMERS</span>
              <span className="value">{property.acf?.bedrooms || '-'}</span>
            </div>
            <div className="pd-stat">
              <span className="label">BOUWJAAR</span>
              <span className="value">{property.acf?.construction_year || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {photoIndex !== null && allImages[photoIndex] && (
        <div className="pd-overlay" onClick={() => setPhotoIndex(null)}>
          <button className="pd-close">✕ Sluiten</button>
          
          <button className="pd-arrow prev" onClick={(e) => { 
            e.stopPropagation(); 
            setPhotoIndex((photoIndex - 1 + allImages.length) % allImages.length); 
          }}>‹</button>
          
          <div className="pd-view-box" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[photoIndex]} alt="Vergroting" />
            <div className="pd-counter">{photoIndex + 1} / {allImages.length}</div>
          </div>

          <button className="pd-arrow next" onClick={(e) => { 
            e.stopPropagation(); 
            setPhotoIndex((photoIndex + 1) % allImages.length); 
          }}>›</button>
        </div>
      )}
    </div>
  );
};


export default PropertyDetail;