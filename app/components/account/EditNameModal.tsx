import { useEffect, useState } from 'react';

import Button from '../Button';
import ModalShell from '../ModalShell';
import TextField from '../TextField';
import { View } from 'react-native';
import { notify } from '../../utils/alert';
import { updateProfile } from '@/db/repo/profile';
import { useDB } from '@/db/dbProvider';

interface EditNameModalProps {
  visible: boolean;
  /** The name as it stands; the field starts from it each time the modal opens. */
  name: string;
  onRequestClose: () => void;
}

/** Renames the signed-in user. Writes the profile row, which syncs like any other edit. */
const EditNameModal = ({ visible, name, onRequestClose }: EditNameModalProps) => {
  const db = useDB();
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);
  const trimmed = draft.trim();

  useEffect(() => {
    if (visible) setDraft(name);
  }, [visible, name]);

  const handleSave = async () => {
    if (!trimmed || saving) return;
    if (trimmed === name) return onRequestClose();

    setSaving(true);
    try {
      await updateProfile(db, { displayName: trimmed });
      onRequestClose();
    } catch (error) {
      console.error('Error renaming profile:', error);
      notify('Could not save', 'Your name was not changed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      visible={visible}
      onRequestClose={saving ? undefined : onRequestClose}
      title='Your name'
      footer={
        <>
          <Button label='Cancel' variant='grey' onPress={onRequestClose} disabled={saving} />
          <Button
            label={saving ? 'Saving…' : 'Save'}
            onPress={() => void handleSave()}
            disabled={!trimmed || saving}
          />
        </>
      }
    >
      <View className='mt-4'>
        <TextField
          label='Name'
          value={draft}
          onChangeText={setDraft}
          placeholder='Alex Rivera'
          autoFocus
          autoCapitalize='words'
          autoComplete='name'
          textContentType='name'
          returnKeyType='done'
          onSubmitEditing={() => void handleSave()}
          editable={!saving}
        />
      </View>
    </ModalShell>
  );
};

export default EditNameModal;
