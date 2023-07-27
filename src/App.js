import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,  
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  updateNote as updateNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
    };
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function updateNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      id: currentNote.id,
      name: form.get("name"),
      description: form.get("description"),
    };
    await API.graphql({
      query: updateNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    setCurrentNote(null);
  }

  async function deleteNote({ id }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
  <nav className="navbar">
    <div className="navbar-icon">
      <img src="https://raw.githubusercontent.com/Wasabi95/NavBar-SideMenu/master/images/cc.png" alt="Logo" />
    </div>
    <div className="navbar-title">
      <Heading level={1}>My Notes Wasa</Heading>
    </div>
    <div className="navbar-login">   
       
     
        <Button>
          <FontAwesomeIcon icon={faUser} size="lg" />
          Sign In
        </Button>
   
    </div>
  </nav>
      <View as="form" margin="3rem 0" onSubmit={currentNote ? updateNote : createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
            defaultValue={currentNote ? currentNote.name : ""}
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
            defaultValue={currentNote ? currentNote.description : ""}
          />
          <Button type="submit" variation="primary">
            {currentNote ? "Update Note" : "Create Note"}
          </Button>
          {currentNote && (
            <Button variation="warning" onClick={() => setCurrentNote(null)}>
              Cancel
            </Button>
          )}
        </Flex>
      </View>

      <Heading level={2}>Current Notes</Heading>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr key={note.id || note.name}>
              <td>{note.name}</td>
              <td>{note.description}</td>
              <td>
                <Button
                  variation="link"
                  onClick={() => setCurrentNote(note)}
                >
                  Edit
                </Button>
              </td>
              <td>
                <Button variation="link" onClick={() => deleteNote(note)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);

