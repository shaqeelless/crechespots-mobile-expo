import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { ApplicationNote } from '../types';

interface NotesSectionProps {
  applicationNotes: ApplicationNote[];
}

export default function NotesSection({
  applicationNotes,
}: NotesSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Application Notes</Text>
        <Text style={styles.sectionSubtitle}>{applicationNotes.length} notes</Text>
      </View>
      {applicationNotes.length > 0 ? (
        applicationNotes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <View style={styles.noteAuthorInfo}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorAvatarText}>
                    {note.users.first_name.charAt(0)}{note.users.last_name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.noteAuthor}>
                  {note.users.first_name} {note.users.last_name}
                </Text>
              </View>
              <Text style={styles.noteDate}>
                {new Date(note.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.noteText}>{note.note}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <BookOpen size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No notes available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authorAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  noteDate: {
    fontSize: 12,
    color: '#64748b',
  },
  noteText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});