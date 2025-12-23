import { Link } from 'react-router-dom';

const PropertyCard = ({ property }: { property: any }) => {
  const acf = property.acf || {};
  const img = property._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <div className="property-card">
      <Link to={`/property/${property.id}`}>
        <div className="image-box">
          {img ? <img src={img} alt="" /> : <div className="placeholder">Geen foto</div>}
        </div>
        <div className="card-info">
          <h3>{property.title.rendered}</h3>
          <p className="price">€ {Number(acf.price).toLocaleString('nl-NL')}</p>
          <div className="tags">
            <span>{acf.bedrooms} bedden</span> • <span>{acf.square_footage} m²</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;