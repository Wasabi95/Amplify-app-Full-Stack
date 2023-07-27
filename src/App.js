import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from 'aws-amplify';
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from '@aws-amplify/ui-react';
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  updateNote as updateNoteMutation,
} from "./graphql/mutations";

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  const [updateNoteId, setUpdateNoteId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image ? image.name : null,
    };
    if (data.image) await Storage.put(data.name, image);
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await Storage.remove(name);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  async function updateNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image ? image.name : null,
    };
    if (data.image) await Storage.put(data.name, image);
    await API.graphql({
      query: updateNoteMutation,
      variables: { input: { ...data, id: updateNoteId } },
    });
    setUpdateNoteId(null);
    fetchNotes();
    event.target.reset();
  }

  function editNote(note) {
    setUpdateNoteId(note.id);
  }

  return (
    <View className="App" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={updateNote} enctype="multipart/form-data">
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <View
            name="image"
            as="input"
            type="file"
            style={{ alignSelf: "end" }}
          />
          <Button type="submit" variation="primary">
            {updateNoteId ? "Update Note" : "Create Note"}
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0" style={{ width: "80%", maxWidth: "800px" }}>
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Note Name</th>
              <th>Note Description</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id || note.name}>
                <td>{note.name}</td>
                <td>{note.description}</td>
                <td>
                  {note.image && (
                    <Image src={note.image} alt={`visual aid for ${note.name}`} style={{ width: 100 }} />
                  )}
                </td>
                <td>
                  <Button variation="link" onClick={() => editNote(note)}>
                    Edit
                  </Button>
                  <Button variation="link" onClick={() => deleteNote(note)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </View>
      {updateNoteId && (
        <Button onClick={() => setUpdateNoteId(null)}>Cancel Edit</Button>
      )}
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);

