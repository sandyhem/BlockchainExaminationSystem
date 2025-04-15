import {db} from '../firebase-config.js'
import { 
    collection, 
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc, 
    query,
    where
} 
from 'firebase/firestore'


//(firestoreinstance, collection name)
const registerCollectionRef = collection(db, "register");

 const addUser = async (user) => {
    const q = query(registerCollectionRef, where("email", "==", user.email),where("univID", "==", user.univID));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        throw new Error("User already exists.");
    } else {
        await addDoc(registerCollectionRef, user);
    }
 }

 const getUsers = async () => {
     const data = await getDocs(registerCollectionRef);
     const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
     return filteredData;
 }

 const getUser = async (id) => {
    // (database instance, collection name, document id)
     const userDoc = doc(db, "register", id);//check doc present in collection
     const userData = await getDocs(userDoc);
     return userData;
 }

 
 const getByQuery = async(email,password,role)=>{
    const  q = query(
        registerCollectionRef,
        where("email","==",email),
        where("role","==",role),
        where("password","==",password)
     );
     const querySnapshot = await getDocs(q);
     if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      } else {
        return null;
      }
 }
 
 const getByEmail = async(email,role)=>{
    const  q = query(
        registerCollectionRef,
        where("email","==",email),
        where("role","==",role)
     );
     const querySnapshot = await getDocs(q);
     if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      } else {
        return null;
      }
 }
 const updateUser = async (id,updateduser) => {
    // (database instance, collection name, document id)
     const userDoc = doc(db, "register", id);//check doc present in collection
     await updateDoc(userDoc, updateduser)
 }
 const deleteUser = async (id) => {
        const userDoc = doc(db, "register", id);
        await deleteDoc(userDoc)
 }

 const updateGenerateField = async (id, generateValue) => {
  try {
    const userDoc = doc(db, "register", id);
    await updateDoc(userDoc, { generate: generateValue });
    console.log(`Successfully updated 'generate' field for user ${id}`);
  } catch (error) {
    console.error("Error updating 'generate' field:", error);
  }
};
export default {
  addUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getByQuery,
  getByEmail,
  updateGenerateField
};
