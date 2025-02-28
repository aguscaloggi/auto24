import { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import "../css/ProfilePage.css";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isAgency, setIsAgency] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [bannerImg, setBannerImg] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        setIsAgency(docSnap.data().agency || false);
      }
      setLoading(false);
    };
    
    fetchUserData();
  }, []);

  const handleImageUpload = async (file, isBanner = false) => {
    const storageRef = ref(storage, `/${auth.currentUser.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {};

    // Subir imágenes
    if (profilePic) updates.profilepic = await handleImageUpload(profilePic);
    if (bannerImg) updates.bannerimg = await handleImageUpload(bannerImg, true);

    // Actualizar datos comunes
    updates.name = formData.get('name');
    updates.phone = formData.get('phone');
    updates.location = {
      city: formData.get('city'),
      state: formData.get('state'),
      cp: formData.get('cp')
    };

    // Datos específicos de agencia
    if (isAgency) {
      updates.agency = true;
      updates.location.street = formData.get('street');
      updates.location.streetNumber = formData.get('streetNumber');
      updates.activityStart = formData.get('activityStart');
      updates.googlemaplocation = formData.get('googlemap');
      
      // Actualizar/crear registro en agencies
      await setDoc(doc(db, 'agencies', auth.currentUser.uid), {
        ...updates,
        adminId: auth.currentUser.uid,
        createdAt: new Date()
      }, { merge: true });
    }

    // Actualizar usuario
    await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
    alert('Perfil actualizado!');
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="profile-container">
      <h3>Tu cuenta</h3>
      <span>Editá y completá tu perfil.</span>
      {!userData?.agency && (
        <div className="account-type-selector">
        <label className="radio-option">
          <input 
            type="radio" 
            name="accountType" 
            checked={!isAgency}
            onChange={() => setIsAgency(false)}
          />
          <span className="radio-custom"></span>
          Particular
        </label>
        
        <label className="radio-option">
          <input 
            type="radio" 
            name="accountType" 
            checked={isAgency}
            onChange={() => setIsAgency(true)}
          />
          <span className="radio-custom"></span>
          Agencia
        </label>
      </div>      
      )}

      <form onSubmit={handleSubmit}>
        {/* Campos comunes */}
        <div className='name-section'>
          <input name="firstname" defaultValue={userData?.firstname} placeholder="Nombre" required />
          <input name="secondname" defaultValue={userData?.secondname} placeholder="Apellido" required />
        </div>
        <div className='contact'>
          {/* <input name="correo"/> quiero que muestre el correo del usuario */}
          <input name="phone" defaultValue={userData?.phone} placeholder="Teléfono" required />
        </div>

        
        <div className="location-section">
          <input name="state" defaultValue={userData?.location?.state} placeholder="Provincia" required />
          <input name="city" defaultValue={userData?.location?.city} placeholder="Ciudad" required />
          <input name="cp" defaultValue={userData?.location?.cp} placeholder="Código Postal" required />
        </div>

        {/* Campos específicos para agencia */}
        {isAgency && (
          <>
            {/* quiero que si es agencia se ordenen los inputs y vayan en este orden, street, streetnumber, state, city, cp, google map y luego activity start */}
            <input name="street" defaultValue={userData?.location?.street} placeholder="Calle" />
            <input name="streetNumber" defaultValue={userData?.location?.streetNumber} placeholder="Número" />
            <input name="activityStart" type="number" defaultValue={userData?.activityStart} placeholder="Año de inicio" />
            <input name="googlemap" defaultValue={userData?.googlemaplocation} placeholder="URL Google Maps" />
            
            <label>
              Banner de la agencia:
              <input type="file" onChange={(e) => setBannerImg(e.target.files[0])} />
            </label>
          </>
        )}

        <label>
          Foto de perfil:
          <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} />
        </label>

        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  );
};

export default ProfilePage;