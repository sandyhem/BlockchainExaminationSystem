import React from 'react'
import {db} from '../firebase-config.js'
import { 
    collection, 
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc 
} 
from 'firebase/firestore'


//(firestoreinstance, collection name)
const bookCollectionRef = collection(db, "books");

 const addBook = async (book) => {
 //   await addDoc(bookCollectionRef, {title: "Book 1", author: "Author 1"})
     await addDoc(bookCollectionRef, book)
 }
 const getBooks = async () => {
     const data = await getDocs(bookCollectionRef);
     return data;
    //  const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
    //  console.log(filteredData);
 }
 const getBook = async (id) => {
    // (database instance, collection name, document id)
     const bookDoc = doc(db, "books", id);//check doc present in collection
     const bookData = await getDocs(bookDoc);
     return bookData;
 }
 const updateBook = async (id,updatedbook) => {
    // (database instance, collection name, document id)
     const bookDoc = doc(db, "books", id);//check doc present in collection
     await updateDoc(bookDoc, updatedbook)
 }
 const deleteBook = async (id) => {
        const bookDoc = doc(db, "books", id);
        await deleteDoc(bookDoc)
 }

export default {
  addBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
};
