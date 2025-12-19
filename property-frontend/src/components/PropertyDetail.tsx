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
    has_garden: boolean;
    has_pool: boolean;
    has_garage: boolean;
    has_driveway: boolean;
    construction_year: string;
    description?: string;
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

  useEffect(() => {
    if (!id) return;
    fetch(`/wp-json/wp/v2/property/${id}?_embed`)
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

  const featuredImage = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const propertyTypes = property._embedded?.['wp:term']?.[0] || [];
  const { acf } = property;

  return (
    <div className="property-detail">
      <Link to="/" className="property-detail__back">
        ← Terug naar Overzicht
      </Link>

      <div className="property-detail__card">
        <h1 className="property-detail__title">
          {property.title.rendered}
        </h1>

        {featuredImage && (
          <div className="property-detail__image">
            <img src={featuredImage} alt={property.title.rendered} />
          </div>
        )}

        <section className="property-detail__section">
          <h2>Basis Kenmerken</h2>
          <div className="property-detail__grid">
            <div><strong>Prijs</strong>{formatPrice(acf.price)}</div>
            <div><strong>Slaapkamers</strong>{acf.bedrooms}</div>
            <div><strong>Badkamers</strong>{acf.bathrooms}</div>
            <div><strong>Oppervlakte</strong>{acf.square_footage} m²</div>
            <div><strong>Bouwjaar</strong>{acf.construction_year || 'Onbekend'}</div>
          </div>
        </section>

        <section className="property-detail__section">
          <h2>Extra Voorzieningen</h2>
          <div className="property-detail__grid">
            <div>{acf.has_garden ? '✅' : '❌'} Tuin</div>
            <div>{acf.has_pool ? '✅' : '❌'} Zwembad</div>
            <div>{acf.has_garage ? '✅' : '❌'} Garage</div>
            <div>{acf.has_driveway ? '✅' : '❌'} Oprit</div>
          </div>
        </section>

        {propertyTypes.length > 0 && (
          <section className="property-detail__section">
            <h2>Type(s)</h2>
            <div className="property-detail__tags">
              {propertyTypes.map(term => (
                <span key={term.id}>{term.name}</span>
              ))}
            </div>
          </section>
        )}

        {acf.description && (
          <section className="property-detail__section">
            <h2>Beschrijving</h2>
            <p className="property-detail__description">
              {acf.description}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;