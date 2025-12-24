import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import './PropertyDetail.scss';

const fetcher = (url: string) => 
  fetch(url, {
    headers: {
      'Authorization': 'Basic ' + btoa('staple:temporary')
    }
  }).then(res => res.json());

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // De URL is nu gefilterd ÉN bevat de foto-data (_links, _embedded)
  const { data: property, error, isLoading } = useSWR(
    `https://dev-property-dashboard.pantheonsite.io/wp-json/wp/v2/property/${id}?_fields=id,title,acf,_links,_embedded&_embed`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const acf = property?.acf || {};
  
  // Deze logica werkt nu weer omdat we _embedded hebben toegevoegd aan de fields
  const featuredImage = property?._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const gallery: string[] = Array.isArray(acf.property_gallery) ? acf.property_gallery : [];
  const allImages = featuredImage ? [featuredImage, ...gallery] : gallery;
  const extraCount = gallery.length - 2;

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev < allImages.length - 1 ? prev + 1 : 0));
  }, [allImages.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allImages.length - 1));
  }, [allImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, nextImage, prevImage]);

  if (error) return <div className="pd-error">Fout bij laden.</div>;
  if (isLoading || !property) return <div className="pd-loading">Woning laden...</div>;

  return (
    <div className="pd-root">
      <div className="pd-container">
        <Link to="/" className="pd-back">← Terug naar overzicht</Link>
        <h1 className="pd-title">{property.title?.rendered}</h1>

        <div className="pd-mosaic-grid">
          <div className="pd-main-img" onClick={() => setLightboxIndex(0)}>
            {featuredImage ? <img src={featuredImage} alt="Main" /> : <div className="pd-placeholder">Geen foto</div>}
          </div>
          <div className="pd-side-imgs">
            <div className="pd-side-item" onClick={() => setLightboxIndex(1)}>
              {gallery[0] ? <img src={gallery[0]} alt="G1" /> : <div className="pd-placeholder" />}
            </div>
            <div className="pd-side-item" onClick={() => setLightboxIndex(2)}>
              {gallery[1] ? (
                <>
                  <img src={gallery[1]} alt="G2" />
                  {extraCount > 0 && <div className="pd-overlay"><span>+{extraCount}</span></div>}
                </>
              ) : <div className="pd-placeholder" />}
            </div>
          </div>
        </div>

        <div className="pd-info">
          <div className="pd-stats">
            <div className="pd-stat"><span className="label">PRIJS</span><span className="value">€ {Number(acf.price || 0).toLocaleString('nl-NL')}</span></div>
            <div className="pd-stat"><span className="label">SLAAPKAMERS</span><span className="value">{acf.bedrooms || 0}</span></div>
            <div className="pd-stat"><span className="label">BADKAMERS</span><span className="value">{acf.bathrooms || 0}</span></div>
            <div className="pd-stat"><span className="label">OPPERVLAKTE</span><span className="value">{acf.square_footage || 0} m²</span></div>
          </div>

          <div className="pd-content-split">
            <div className="pd-desc">
              <h3>Beschrijving</h3>
              <p>{acf.description || "Geen beschrijving beschikbaar."}</p>
            </div>
            
            <div className="pd-details-list">
              <h3>Kenmerken</h3>
              <ul>
                <li><strong>Bouwjaar:</strong> {acf.construction_year || 'Onbekend'}</li>
                <li><strong>Tuin:</strong> {acf.garden ? 'Ja' : 'Nee'}</li>
                <li><strong>Garage:</strong> {acf.garage ? 'Ja' : 'Nee'}</li>
                <li><strong>Oprit:</strong> {acf.driveway ? 'Ja' : 'Nee'}</li>
                <li><strong>Zwembad:</strong> {acf.pool ? 'Ja' : 'Nee'}</li>
              </ul>
            </div>
          </div>
        </div>

        {lightboxIndex !== null && (
          <div className="pd-lightbox" onClick={() => setLightboxIndex(null)}>
            <button className="pd-close" onClick={() => setLightboxIndex(null)}>✕</button>
            <button className="pd-arrow prev" onClick={prevImage}>&#10094;</button>
            <div className="pd-view-box" onClick={(e) => e.stopPropagation()}>
              <img src={allImages[lightboxIndex]} alt="Full view" />
              <div className="pd-counter">{lightboxIndex + 1} / {allImages.length}</div>
            </div>
            <button className="pd-arrow next" onClick={nextImage}>&#10095;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;