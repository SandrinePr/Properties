import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    'wp:term'?: [{ id: number; name: string; slug: string }[]];
  };
}

const formatPrice = (priceString: string) => {
  const price = parseInt(priceString, 10);
  return isNaN(price) ? "Prijs op aanvraag" : price.toLocaleString('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  });
};

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Slider state
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://headless-property-wp.local';
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa('staple:temporary'));

    fetch(`${API_URL}/wp-json/wp/v2/property/${id}?_embed`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Woning niet gevonden');
        return res.json();
      })
      .then(data => {
        setProperty(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <div className="property-detail__state">Laden...</div>;
  if (error) return <div className="property-detail__state error">{error}</div>;
  if (!property) return null;

  const { acf } = property;
  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const galleryImages = Array.isArray(acf.property_gallery) ? acf.property_gallery : [];
  
  const allImages = featuredImage 
    ? [featuredImage, ...galleryImages.filter(img => img !== featuredImage)]
    : galleryImages;

  // Slider navigatie functies
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  return (
    <div className="property-detail">
      <Link to="/" className="property-detail__back">← Terug naar Overzicht</Link>

      <div className="property-detail__card">
        <h1 className="property-detail__title">{property.title.rendered}</h1>

        {/* De Slider Component */}
        <div className="property-slider">
          {allImages.length > 0 ? (
            <div className="property-slider__container">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={allImages[currentIndex]}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  alt={`Foto ${currentIndex + 1}`}
                  className="property-slider__image"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              {allImages.length > 1 && (
                <>
                  <button className="property-slider__btn property-slider__btn--prev" onClick={prevSlide}>❮</button>
                  <button className="property-slider__btn property-slider__btn--next" onClick={nextSlide}>❯</button>
                  <div className="property-slider__counter">
                    {currentIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="property-detail__no-image">Geen afbeeldingen beschikbaar</div>
          )}
        </div>

        <section className="property-detail__section">
          <h2>Basis Kenmerken</h2>
          <div className="property-detail__grid">
            <div><strong>Prijs: </strong>{formatPrice(acf.price)}</div>
            <div><strong>Slaapkamers: </strong>{acf.bedrooms}</div>
            <div><strong>Badkamers: </strong>{acf.bathrooms}</div>
            <div><strong>Oppervlakte: </strong>{acf.square_footage} m²</div>
            <div><strong>Bouwjaar: </strong>{acf.construction_year || 'Onbekend'}</div>
          </div>
        </section>

        <section className="property-detail__section">
          <h2>Extra Voorzieningen</h2>
          <div className="property-detail__grid">
            <div>{acf.garden ? '✅' : '❌'} Tuin</div>
            <div>{acf.pool ? '✅' : '❌'} Zwembad</div>
            <div>{acf.garage ? '✅' : '❌'} Garage</div>
            <div>{acf.driveway ? '✅' : '❌'} Oprit</div>
          </div>
        </section>

        {acf.description && (
          <section className="property-detail__section">
            <h2>Beschrijving</h2>
            <p className="property-detail__description">{acf.description}</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;