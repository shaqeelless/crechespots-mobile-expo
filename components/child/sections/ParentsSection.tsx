import React from 'react';
import { View, Text } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { ApplicationNote } from '../types';
import {
  sharedStyles,
  notesStyles,
} from '../styles';

interface NotesSectionProps {
  applicationNotes: ApplicationNote[];
}

export default function NotesSection({
  applicationNotes,
}: NotesSectionProps) {
  return (
    <View style={sharedStyles.section}>
      <View style={sharedStyles.sectionHeader}>
        <Text style={sharedStyles.sectionTitle}>Application Notes</Text>
        <Text style={sharedStyles.sectionSubtitle}>{applicationNotes.length} notes</Text>
      </View>
      {applicationNotes.length > 0 ? (
        applicationNotes.map((note) => (
          <View key={note.id} style={notesStyles.noteCard}>
            <View style={notesStyles.noteHeader}>
              <View style={notesStyles.noteAuthorInfo}>
                <View style={notesStyles.authorAvatar}>
                  <Text style={notesStyles.authorAvatarText}>
                    {note.users.first_name.charAt(0)}{note.users.last_name.charAt(0)}
                  </Text>
                </View>
                <Text style={notesStyles.noteAuthor}>
                  {note.users.first_name} {note.users.last_name}
                </Text>
              </View>
              <Text style={notesStyles.noteDate}>
                {new Date(note.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={notesStyles.noteText}>{note.note}</Text>
          </View>
        ))
      ) : (
        <View style={sharedStyles.emptyState}>
          <BookOpen size={48} color="#d1d5db" />
          <Text style={sharedStyles.emptyText}>No notes available</Text>
        </View>
      )}
    </View>
  );
}