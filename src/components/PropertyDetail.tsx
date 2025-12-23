import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetail.scss';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const API_URL = 'https://dev-property-dashboard.pantheonsite.io';
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

  if (!property || !property.acf) return <div className="pd-loading">Laden...</div>;

  const acf = property.acf;
  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug</Link>
        <h1 className="pd-title">{property.title.rendered}</h1>
        
        <div className="pd-main-image">
          {featuredImage && <img src={featuredImage} alt="Property" referrerPolicy="no-referrer" />}
        </div>

        <div className="pd-info-card">
          <div className="pd-stats">
            <div className="pd-stat">
              <span className="label">PRIJS</span>
              <span className="value">€ {Number(acf.price).toLocaleString('nl-NL')}</span>
            </div>
            <div className="pd-stat">
              <span className="label">SLAAPKAMERS</span>
              <span className="value">{acf.bedrooms}</span>
            </div>
            <div className="pd-stat">
              <span className="label">OPPERVLAKTE</span>
              <span className="value">{acf.square_footage} m²</span>
            </div>
          </div>
          <div className="pd-description" style={{marginTop: '20px', textAlign: 'left'}}>
            <p>{acf.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;