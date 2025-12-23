import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetail.scss';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));
      const res = await fetch(`https://dev-property-dashboard.pantheonsite.io/wp-json/wp/v2/property/${id}?_embed`, { headers });
      const data = await res.json();
      setProperty(data);
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  if (loading || !property) return <div className="loading">Laden...</div>;

  const acf = property.acf || {};
  const images = property._embedded?.['acf:attachment']?.map((img: any) => img.source_url) || [];
  if (images.length === 0 && property._embedded?.['wp:featuredmedia']) {
    images.push(property._embedded['wp:featuredmedia'][0].source_url);
  }

  return (
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug naar overzicht</Link>
        <h1>{property.title.rendered}</h1>

        <div className="pd-gallery">
          {images.length > 0 ? (
            <div className="slider-box">
              <img src={images[imgIndex]} alt="Property" />
              {images.length > 1 && (
                <div className="slider-nav">
                  <button onClick={() => setImgIndex((imgIndex - 1 + images.length) % images.length)}>❮</button>
                  <button onClick={() => setImgIndex((imgIndex + 1) % images.length)}>❯</button>
                </div>
              )}
            </div>
          ) : <div className="placeholder">Geen foto's</div>}
        </div>

        <div className="pd-info">
          <div className="pd-stats-box">
            <p><strong>Prijs:</strong> € {Number(acf.price).toLocaleString('nl-NL')}</p>
            <p><strong>Slaapkamers:</strong> {acf.bedrooms}</p>
            <p><strong>Oppervlakte:</strong> {acf.square_footage} m²</p>
          </div>
          <div className="pd-description">
            <h2>Omschrijving</h2>
            <p>{acf.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;