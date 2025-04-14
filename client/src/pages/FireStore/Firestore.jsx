import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import bookservice from './services/bookservice'

export default function Firestore() {
 const [title, setTitle] = useState("")
 const [author, setAuthor] = useState("")
 const [status, setStatus] = useState("")
const [books, setBooks] = useState([])
const [book, setBook] = useState("")
 const [message,setMessage] = useState({error:"false",msg:""})

 useEffect(() => {
    getBooks();
},[])

const getBooks = async () => {
    const data = await bookservice.getBooks();
    console.log(data.docs);
    setBooks(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
}

const deleteBook = async (id) => {
   await bookservice.deleteBook(id);
   getBooks();
}

const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if(title === "" || author === "" || status === ""){
        setMessage({error:"true",msg:"Please fill all the fields"})
    }
    else{
        const newBook ={
            title,
            author,
            status
        }
        console.log(newBook);
        try {
            await bookservice.addBook(newBook);
            setTitle("");
            setAuthor("");   
            setStatus("");
            setMessage({error:"false",msg:"Book added successfully"})
        } catch (error) {
            console.log(error);
            setMessage({error:"true",msg:"Error adding book"})
        }
    }
}
  return (
   <>
   {message?.msg && <div className={message.error === "true" ? "alert alert-danger" : "alert alert-success"}>{message.msg}</div>}
   <h1>Add Book</h1>
    <p>Fill the form to add a book</p>
    <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>author</Form.Label>
            <Form.Control type="text" placeholder="Enter author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>status</Form.Label>
            <Form.Control type="text" placeholder="Enter status" value={status} onChange={(e) => setStatus(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit">Submit</Button>
    </Form>
    <pre>{JSON.stringify(books, undefined, 2)}</pre>
    <h1>Books</h1>
    <button variant="primary"  onClick={() => getBooks()}>Refresh List</button>
    <table className="table">
        <thead>
            <tr>
                <th scope='col'>#</th>
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Status</th>
                <th scope="col">Edit</th>
                <th scope="col">Delete</th>
            </tr>
        </thead>
        <tbody>
            {books.map((book,idx) => (
                <tr key={book.id}>
                    <td>{idx+1}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.status}</td>
                    <td><Button variant="primary" onClick={() => setBook(book)}>Edit</Button></td>
                    <td><Button variant="danger" onClick={() => deleteBook(book.id)}>Delete</Button></td>
                </tr>
            ))}
        </tbody>
    </table>
   </>
  )
}
