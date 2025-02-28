import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import CarCard from "../components/CarCard";
import "../css/Publicados.css";

function Home() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'cars'));
                const carsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCars(carsData);
            } catch (error) {
                console.error("Error fetching cars:", error);
                setError("Error al cargar los vehículos");
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    if (loading) return <div>Cargando vehículos...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="home">
            <h2 className="home-welcome">Bienvenido</h2>
            <p className="home-p1">Encontrá o publicá tu próximo auto. Nuevos, usados y oportunidades únicas al alcance de un clic.</p>
            <div className="cars-grid">
                {cars.map(car => (
                    <CarCard car={car} key={car.id} />
                ))}
            </div>
        </div>
    );
}

export default Home;