import '../css/CarCard.css';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

function CarCard({ car }) {
    const [sellerName, setSellerName] = useState('Cargando...');
    const [rating, setRating] = useState(null);
    const [reviews, setReviews] = useState([]);
    const mainPhoto = car.photos?.[0] || 'https://via.placeholder.com/300';
    const carTitle = `${car.brand} ${car.model}`;

    useEffect(() => {
        const fetchSellerInfo = async () => {
            try {
                const userRef = doc(db, 'users', car.createdBy);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    setSellerName('Usuario no registrado');
                    return;
                }

                const userData = userSnap.data();
                const agenciesQuery = query(collection(db, 'agencies'), where("adminId", "==", car.createdBy));
                const agencySnapshot = await getDocs(agenciesQuery);

                if (!agencySnapshot.empty) {
                    const agencyData = agencySnapshot.docs[0].data();
                    setSellerName(agencyData.name);
                    fetchAgencyReviews(agencySnapshot.docs[0].id);
                    return;
                }

                const allAgencies = await getDocs(collection(db, 'agencies'));
                let isEmployee = false;
                
                for (const agencyDoc of allAgencies.docs) {
                    const employeesQuery = query(
                        collection(db, `agencies/${agencyDoc.id}/employees`),
                        where("userId", "==", car.createdBy)
                    );
                    const employeeSnapshot = await getDocs(employeesQuery);
                    
                    if (!employeeSnapshot.empty) {
                        isEmployee = true;
                        setSellerName(agencyDoc.data().name);
                        fetchAgencyReviews(agencyDoc.id);
                        break;
                    }
                }

                if (!isEmployee) setSellerName('Vendedor Particular');

            } catch (error) {
                console.error('Error:', error);
                setSellerName('Error de información');
            }
        };

        const fetchAgencyReviews = async (agencyId) => {
            try {
                const reviewsRef = collection(db, `agencies/${agencyId}/reviews`);
                const reviewsSnapshot = await getDocs(reviewsRef);
                
                const reviewsData = [];
                let totalRating = 0;
                
                reviewsSnapshot.forEach(doc => {
                    const review = doc.data();
                    reviewsData.push(review);
                    totalRating += review.rating;
                });

                setReviews(reviewsData);
                setRating(reviewsData.length > 0 ? totalRating / reviewsData.length : null);
                
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        if (car.createdBy) fetchSellerInfo();
    }, [car.createdBy]);

    const renderStars = (avgRating) => {
        if (!avgRating) return 'Sin valoraciones';
        
        const fullStars = Math.floor(avgRating);
        const decimalPart = avgRating % 1;
        const hasHalfStar = decimalPart >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <div className="rating-stars">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="material-symbols-outlined filled">star</span>
                ))}
                {hasHalfStar && (
                    <span className="material-symbols-outlined filled">star_half</span>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="material-symbols-outlined">star</span>
                ))}
            </div>
        );
    };

    const OnFavoriteClick = () => {
        alert("clicked");
    };

    return (
        <div className="car-card">
            <div className="card-divider">
                <div className="car-mainphoto">
                    <img src={mainPhoto} alt={carTitle} />
                    <div className="car-overlay">
                        <button className="fav-btn" onClick={OnFavoriteClick}>
                            <span className="material-icons">favorite</span>
                        </button>
                        <p className="condition-badge">{car.condition}</p>
                    </div>
                </div>
                
                <div className="car-info">
                    <div className="info-header">
                        <div className="condition-container">
                            <h1 className="car-title">{carTitle}</h1>
                        </div>
                        <div className="pricing">
                            <span className="original-price">${car.price?.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="home-year-mileage">
                        <span>{car.year}</span>
                        <span className="separator">|</span>
                        <span className="home-mileage">
                            {car.mileage?.toLocaleString()} km
                        </span>
                    </div>
                    <div className='seller-details'>
                        <h2 className='seller-name'>{sellerName}</h2>
                        {sellerName !== 'Vendedor Particular' && (
                            <div className="agency-rating">
                                {rating && (
                                    <>
                                        <span className="rating-number">{rating.toFixed(1)}</span>
                                        {renderStars(rating)}
                                        {reviews.length > 0 && (
                                            <span className="reviews-count">
                                                ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="details-row location-container">
                        <span className="location">{car.city}, {car.state}</span>
                        <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <button className="availability-btn">
                        Contactar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CarCard;