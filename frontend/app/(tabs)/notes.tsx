
// imports
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

// Note displayed in the frontend
interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

// Shape of a note returned by FastAPI / Beanie
interface BackendNote {
  id?: string | null;
  _id?: string | { $oid?: string } | null;
  title?: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

// GET response
interface NotesListResponse {
  notes?: BackendNote[];
  [key: string]: unknown;
}

// POST / PUT response
interface NoteMutationResponse {
  message: string;
  note: BackendNote;
}

// Request body
interface NotePayload {
  title: string;
  content: string;
}

// Convert backend note into frontend note
const normalizeNote = (backendNote: BackendNote): Note => {
  const rawId = backendNote.id ?? backendNote._id;

  const id =
    typeof rawId === "string"
      ? rawId
      : typeof rawId === "object" && rawId !== null
        ? rawId.$oid
        : undefined;

  if (!id) {
    throw new Error("The backend returned a note without an ID.");
  }

  const dateValue =
    backendNote.updated_at ?? backendNote.created_at;

  const parsedDate = dateValue
    ? new Date(dateValue).getTime()
    : Date.now();

  return {
    id,
    title: backendNote.title || "Sem título",
    content: backendNote.content ?? "",
    updatedAt: Number.isNaN(parsedDate) ? Date.now() : parsedDate,
  };
};

export default function UserNotesTab() {
  const { width, height } = useWindowDimensions();

  const { user, loading: authLoading } = useAuth();
  const userId = user?._id ?? null;

  // Saved notes
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Editor state
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const [saving, setSaving] = useState(false);

  // Load notes from the backend
  useEffect(() => {
    let isActive = true;

    const loadNotes = async () => {
      if (authLoading) return;

      if (!userId) {
        if (isActive) {
          setNotes([]);
          setNotesLoading(false);
        }
        return;
      }

      try {
        const response = await api.get<NotesListResponse>(
          `/notes/${userId}`
        );

        // Support the updated backend response.
        // The second option also supports the previous response format.
        const legacyResponse = response.data[
          `Note for user ${userId}`
        ];

        const backendNotes =
          response.data.notes ??
          (Array.isArray(legacyResponse)
            ? (legacyResponse as BackendNote[])
            : []);

        const normalizedNotes = backendNotes
          .map(normalizeNote)
          .sort((a, b) => b.updatedAt - a.updatedAt);

        if (isActive) {
          setNotes(normalizedNotes);
          setNotesError(null);
        }
      } catch (error) {
        // Compatibility with the older backend, which returned 404
        // when a user had no saved notes.
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404
        ) {
          if (isActive) {
            setNotes([]);
            setNotesError(null);
          }
        } else {
          console.error("[Notes] Could not load notes:", error);

          if (isActive) {
            setNotesError(
              "Não foi possível carregar as tuas notas."
            );
          }
        }
      } finally {
        if (isActive) {
          setNotesLoading(false);
        }
      }
    };

    void loadNotes();

    return () => {
      isActive = false;
    };
  }, [userId, authLoading, reloadKey]);

  // Open editor for a new note
  const createNewNote = () => {
    setEditingNoteId(null);
    setDraftTitle("");
    setDraftContent("");
    setEditorVisible(true);
  };

  // Open an existing note
  const editNote = (note: Note) => {
    setEditingNoteId(note.id);
    setDraftTitle(note.title === "Sem título" ? "" : note.title);
    setDraftContent(note.content);
    setEditorVisible(true);
  };

  // Close editor
  const closeEditor = () => {
    setEditorVisible(false);
    setEditingNoteId(null);
    setDraftTitle("");
    setDraftContent("");
  };

  // Save a new note or update an existing one
  const saveNote = async () => {
    if (!draftTitle.trim() && !draftContent.trim()) {
      Alert.alert(
        "Nota vazia",
        "Escreve alguma coisa antes de guardar a nota."
      );
      return;
    }

    if (!userId) {
      Alert.alert(
        "Sessão necessária",
        "Inicia sessão para guardar as tuas notas."
      );
      return;
    }

    if (saving) return;

    const payload: NotePayload = {
      title: draftTitle.trim() || "Sem título",
      content: draftContent,
    };

    setSaving(true);

    try {
      let response;

      if (editingNoteId) {
        // Update existing note
        response = await api.put<NoteMutationResponse>(
          `/notes/${editingNoteId}`,
          payload
        );

        const updatedNote = normalizeNote(response.data.note);

        setNotes((currentNotes) =>
          currentNotes
            .map((note) =>
              note.id === editingNoteId ? updatedNote : note
            )
            .sort((a, b) => b.updatedAt - a.updatedAt)
        );
      } else {
        // Create new note
        response = await api.post<NoteMutationResponse>(
          `/notes/${userId}`,
          payload
        );

        const createdNote = normalizeNote(response.data.note);

        setNotes((currentNotes) => [
          createdNote,
          ...currentNotes,
        ]);
      }

      closeEditor();
    } catch (error) {
      console.error("[Notes] Could not save note:", error);

      Alert.alert(
        "Erro",
        "Não foi possível guardar a nota. Tenta novamente."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete a note
  const removeNote = async (noteId: string) => {
    try {
      await api.delete(`/notes/${noteId}`);

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== noteId)
      );

      if (editingNoteId === noteId) {
        closeEditor();
      }
    } catch (error) {
      console.error("[Notes] Could not delete note:", error);

      Alert.alert(
        "Erro",
        "Não foi possível apagar esta nota."
      );
    }
  };

  // Confirm deletion
  const confirmDelete = (noteId: string) => {
    Alert.alert(
      "Apagar nota",
      "Tens a certeza de que queres apagar esta nota?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Apagar",
          style: "destructive",
          onPress: () => {
            void removeNote(noteId);
          },
        },
      ]
    );
  };

  // Format note's last updated date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Render an individual note
  const renderNote = ({ item }: { item: Note }) => {
    const preview =
      item.content.trim().length > 100
        ? `${item.content.trim().slice(0, 100)}...`
        : item.content.trim();

    return (
      <View style={styles.noteCard}>
        <TouchableOpacity
          style={styles.noteContent}
          activeOpacity={0.7}
          onPress={() => editNote(item)}
        >
          <View style={styles.noteCardHeader}>
            <Text style={styles.noteTitle} numberOfLines={1}>
              {item.title}
            </Text>

            <Text style={styles.noteDate}>
              {formatDate(item.updatedAt)}
            </Text>
          </View>

          <Text style={styles.notePreview} numberOfLines={3}>
            {preview || "Sem conteúdo"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.id)}
          accessibilityLabel="Apagar nota"
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color="#A0A0A0"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {notesLoading || authLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C64F23" />
        </View>
      ) : notesError ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={45}
            color="#C64F23"
          />

          <Text style={styles.emptyTitle}>Erro ao carregar notas</Text>

          <Text style={styles.emptyDescription}>
            {notesError}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setNotesLoading(true);
              setReloadKey((current) => current + 1);
            }}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : notes.length === 0 ? (
        // Empty state
        <View
          style={[
            styles.emptyContent,
            {
              paddingTop: height * 0.12,
              paddingHorizontal: width * 0.1,
            },
          ]}
        >
          <Image
            source={require("../../assets/notes/addNotes.png")}
            style={{
              width: width * 0.6,
              height: width * 0.6,
            }}
            resizeMode="contain"
          />

          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyTitle}>Ainda sem notas</Text>

            <Text style={styles.emptyDescription}>
              Começa uma lista ou aponta algo para não te esqueceres mais tarde.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={createNewNote}
            accessibilityLabel="Criar nova nota"
          >
            <Ionicons name="add" size={40} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        // Notes list
        <>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>As minhas notas</Text>

              <Text style={styles.notesCount}>
                {notes.length} {notes.length === 1 ? "nota" : "notas"}
              </Text>
            </View>
          </View>

          <FlatList
            data={notes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notesList}
            showsVerticalScrollIndicator={false}
          />

          {/* Floating add button */}
          <TouchableOpacity
            style={styles.floatingAddButton}
            activeOpacity={0.8}
            onPress={createNewNote}
            accessibilityLabel="Criar nova nota"
          >
            <Ionicons name="add" size={36} color="white" />
          </TouchableOpacity>
        </>
      )}

      {/* Note Editor */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeEditor}
      >
        <KeyboardAvoidingView
          style={styles.editorContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Editor Header */}
          <View style={styles.editorHeader}>
            <TouchableOpacity
              onPress={closeEditor}
              style={styles.editorIconButton}
            >
              <Ionicons
                name="chevron-back"
                size={27}
                color="#2D1A12"
              />
            </TouchableOpacity>

            <Text style={styles.editorHeaderTitle}>
              {editingNoteId ? "Editar nota" : "Nova nota"}
            </Text>

            <TouchableOpacity
              onPress={saveNote}
              style={[
                styles.saveButton,
                saving && { opacity: 0.6 },
              ]}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "A guardar..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Editor Content */}
          <View style={styles.editorContent}>
            <TextInput
              style={styles.titleInput}
              placeholder="Título"
              placeholderTextColor="#A0A0A0"
              value={draftTitle}
              onChangeText={setDraftTitle}
              maxLength={100}
              returnKeyType="next"
            />

            <View style={styles.editorDivider} />

            <TextInput
              style={styles.contentInput}
              placeholder="Começa a escrever..."
              placeholderTextColor="#A0A0A0"
              value={draftContent}
              onChangeText={setDraftContent}
              multiline
              textAlignVertical="top"
              scrollEnabled
            />
          </View>

          {/* Editor Footer */}
          <View style={styles.editorFooter}>
            <Text style={styles.characterHint}>
              {draftContent.length} caracteres
            </Text>

            {editingNoteId && (
              <TouchableOpacity
                onPress={() => confirmDelete(editingNoteId)}
                style={styles.editorDeleteButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color="#C64F23"
                />

                <Text style={styles.editorDeleteText}>
                  Apagar nota
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#C64F23",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 22,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Empty state
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  emptyTextContainer: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 35,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D1A12",
    marginBottom: 10,
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    lineHeight: 22,
  },

  addButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "#C64F23",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  // Notes list
  listHeader: {
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 15,
  },

  listTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D1A12",
  },

  notesCount: {
    fontSize: 14,
    color: "#718096",
    marginTop: 5,
  },

  notesList: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  noteCard: {
    flexDirection: "row",
    backgroundColor: "#FFF9F5",
    borderRadius: 14,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#F0E4DC",
    alignItems: "center",
  },

  noteContent: {
    flex: 1,
    padding: 16,
  },

  noteCardHeader: {
    marginBottom: 9,
  },

  noteTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2D1A12",
    marginBottom: 5,
  },

  noteDate: {
    fontSize: 12,
    color: "#A0A0A0",
  },

  notePreview: {
    fontSize: 14,
    color: "#718096",
    lineHeight: 20,
  },

  deleteButton: {
    padding: 15,
  },

  floatingAddButton: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#C64F23",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  // Editor
  editorContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 55,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E4DC",
  },

  editorIconButton: {
    width: 45,
    height: 40,
    justifyContent: "center",
  },

  editorHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D1A12",
  },

  saveButton: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    backgroundColor: "#C64F23",
    borderRadius: 20,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  editorContent: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 25,
  },

  titleInput: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#2D1A12",
    paddingVertical: 10,
  },

  editorDivider: {
    height: 1,
    backgroundColor: "#F0E4DC",
    marginVertical: 12,
  },

  contentInput: {
    flex: 1,
    fontSize: 16,
    color: "#3D302B",
    lineHeight: 25,
    paddingTop: 10,
  },

  editorFooter: {
    minHeight: 55,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0E4DC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  characterHint: {
    fontSize: 12,
    color: "#A0A0A0",
  },

  editorDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  editorDeleteText: {
    color: "#C64F23",
    fontSize: 13,
    fontWeight: "600",
  },
});
