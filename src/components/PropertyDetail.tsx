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

  if (loading || !property) return <div>Laden...</div>;

  const acf = property.acf || {};
  // Haal alle afbeeldingen op uit de gallery (of gebruik de featured image)
  const images = property._embedded?.['acf:attachment']?.map((img: any) => img.source_url) || 
                 [property._embedded?.['wp:featuredmedia']?.[0]?.source_url].filter(Boolean);

  const nextImg = () => setImgIndex((prev) => (prev + 1) % images.length);
  const prevImg = () => setImgIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug</Link>
        <h1>{property.title.rendered}</h1>

        <div className="pd-gallery">
          {images.length > 0 ? (
            <>
              <img src={images[imgIndex]} alt="Gallery" />
              {images.length > 1 && (
                <div className="pd-nav">
                  <button onClick={prevImg}>❮</button>
                  <button onClick={nextImg}>❯</button>
                </div>
              )}
            </>
          ) : <div className="placeholder">Geen foto's</div>}
        </div>

        <div className="pd-grid">
          <div className="pd-info">
            <h2>Details</h2>
            <ul>
              <li><strong>Prijs:</strong> € {Number(acf.price).toLocaleString()}</li>
              <li><strong>Slaapkamers:</strong> {acf.bedrooms}</li>
              <li><strong>Oppervlakte:</strong> {acf.square_footage} m²</li>
              <li><strong>Bouwjaar:</strong> {acf.construction_year}</li>
            </ul>
          </div>
          <div className="pd-desc">
            <h2>Omschrijving</h2>
            <p>{acf.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;