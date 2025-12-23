import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetail.scss';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'https://dev-property-dashboard.pantheonsite.io';
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));
      
      try {
        const res = await fetch(`${API_URL}/wp-json/wp/v2/property/${id}?_embed`, { headers });
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        console.error("Detail ophalen mislukt:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <div className="pd-loading">Laden...</div>;
  if (!property || property.code === 'rest_no_route') return <div className="pd-error">Woning niet gevonden.</div>;

  const acf = property.acf || {}; 
  const title = property.title?.rendered || 'Object';
  const description = acf.description || 'Geen omschrijving beschikbaar.';
  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

  return (
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug naar overzicht</Link>
        
        <h1 className="pd-title">{title}</h1>

        <div className="pd-main-image">
          {featuredImage ? <img src={featuredImage} alt={title} /> : <div className="pd-placeholder">Geen foto</div>}
        </div>

        <div className="pd-info-card">
          <div className="pd-stats">
            <div className="pd-stat">
              <span className="label">PRIJS</span>
              <span className="value">
                {acf.price ? `€ ${Number(acf.price).toLocaleString('nl-NL')}` : 'Prijs op aanvraag'}
              </span>
            </div>
            <div className="pd-stat">
              <span className="label">SLAAPKAMERS</span>
              <span className="value">{acf.bedrooms || '-'}</span>
            </div>
            <div className="pd-stat">
              <span className="label">OPPERVLAKTE</span>
              <span className="value">{acf.square_footage ? `${acf.square_footage} m²` : '-'}</span>
            </div>
          </div>
        </div>

        <div className="pd-description">
          <h2>Omschrijving</h2>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;