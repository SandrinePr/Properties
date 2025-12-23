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
      } catch (err) { console.error("Detail error", err); }
    };
    fetchProperty();
  }, [id]);

  if (!property || !property.acf) return <div className="pd-loading">Data laden...</div>;

  const acf = property.acf;
  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const gallery: string[] = Array.isArray(acf.property_gallery) ? acf.property_gallery : [];
  
  // We berekenen hoeveel extra foto's er zijn naast de 3 die we tonen
  // (Featured image + 2 gallery images = 3 getoonde foto's)
  const extraCount = gallery.length - 2;

  return (
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug naar overzicht</Link>
        <h1 className="pd-title">{property.title?.rendered}</h1>

        {/* Mosaic Gallery Grid */}
        <div className="pd-mosaic-grid">
          {/* LINKERKANT: Main Image */}
          <div className="pd-main-img">
            {featuredImage ? (
              <img src={featuredImage} alt="Main" referrerPolicy="no-referrer" />
            ) : (
              <div className="pd-placeholder">Geen hoofdafbeelding</div>
            )}
          </div>

          {/* RECHTSKANT: Twee kleinere afbeeldingen boven elkaar */}
          <div className="pd-side-imgs">
            {/* Foto 1 (Rechtsboven) */}
            <div className="pd-side-item">
              {gallery[0] ? (
                <img src={gallery[0]} alt="Gallery 1" />
              ) : (
                <div className="pd-placeholder"></div>
              )}
            </div>

            {/* Foto 2 (Rechtsonder) + Eventuele Plus-tag */}
            <div className="pd-side-item">
              {gallery[1] ? (
                <>
                  <img src={gallery[1]} alt="Gallery 2" />
                  {extraCount > 0 && (
                    <div className="pd-overlay">
                      <span>+{extraCount}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="pd-placeholder"></div>
              )}
            </div>
          </div>
        </div>

        <div className="pd-info">
          <div className="pd-stats">
            <div className="pd-stat">
              <span className="label">PRIJS</span>
              <span className="value">€ {Number(acf.price || 0).toLocaleString('nl-NL')}</span>
            </div>
            <div className="pd-stat">
              <span className="label">SLAAPKAMERS</span>
              <span className="value">{acf.bedrooms || 0}</span>
            </div>
            <div className="pd-stat">
              <span className="label">BADKAMERS</span>
              <span className="value">{acf.bathrooms || 0}</span>
            </div>
            <div className="pd-stat">
              <span className="label">OPPERVLAKTE</span>
              <span className="value">{acf.square_footage || 0} m²</span>
            </div>
            <div className="pd-stat">
              <span className="label">BOUWJAAR</span>
              <span className="value">{acf.construction_year || '-'}</span>
            </div>
            <div className="pd-stat">
              <span className="label">TUIN</span>
              <span className="value">{acf.garden ? 'Ja' : 'Nee'}</span>
            </div>
            <div className="pd-stat">
              <span className="label">GARAGE</span>
              <span className="value">{acf.garage ? 'Ja' : 'Nee'}</span>
            </div>
            <div className="pd-stat">
              <span className="label">OPRIT</span>
              <span className="value">{acf.driveway ? 'Ja' : 'Nee'}</span>
            </div>
            <div className="pd-stat">
              <span className="label">ZWEMBAD</span>
              <span className="value">{acf.pool ? 'Ja' : 'Nee'}</span>
            </div>
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