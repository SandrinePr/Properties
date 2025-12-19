import React from 'react';
import { Link } from 'react-router-dom';

interface Property {
    id: number;
    title: { rendered: string };
    acf: {
        price: string;
        bedrooms: string;
        bathrooms: string;
        square_footage: string;
    };
    _embedded?: {
        'wp:featuredmedia'?: [{ source_url: string }];
    };
}

interface PropertyCardProps {
    property: Property;
}

const formatPrice = (priceString: string) => {
    const price = parseInt(priceString, 10);
    return isNaN(price) ? "Prijs op aanvraag" : price.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    const { title, acf, _embedded } = property;
    const featuredImage = _embedded?.['wp:featuredmedia']?.[0]?.source_url;

    return (
        <div className="property-card">
            {featuredImage && (
                <img 
                    src={featuredImage} 
                    alt={title.rendered} 
                />
            )}

            <div className="card-content">
                <Link to={`/property/${property.id}`}>
                    <h3>{title.rendered}</h3>       
                </Link>

                <span className="price">{formatPrice(acf.price)}</span>

                <div className="specs">
                    <span>🛏️ {acf.bedrooms}</span>
                    <span>🚿 {acf.bathrooms}</span>
                    <span>📏 {acf.square_footage} m²</span>
                </div>

                <Link to={`/property/${property.id}`}>
                    <button>Bekijk Details</button>
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;