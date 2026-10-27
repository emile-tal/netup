import {
  MIN_PASSWORD_LENGTH,
  confirmPasswordProblem,
  passwordProblem,
} from '../../utils/authValidation';
import { Text, TextInput, View } from 'react-native';
import { WrongPasswordError, useAuth } from '@/lib/auth/AuthProvider';
import { useEffect, useRef, useState } from 'react';

import Button from '../Button';
import ModalShell from '../ModalShell';
import TextField from '../TextField';
import { notify } from '../../utils/alert';

interface ChangePasswordModalProps {
  visible: boolean;
  onRequestClose: () => void;
}

/**
 * Current password, new password, confirm. The current one is checked by `changePassword`
 * (it signs in again), so someone holding an unlocked device can't lock the owner out.
 */
const ChangePasswordModal = ({ visible, onRequestClose }: ChangePasswordModalProps) => {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const [wrongCurrent, setWrongCurrent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const newRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // A password must never outlive the dialog it was typed into.
  useEffect(() => {
    if (!visible) return;
    setCurrent('');
    setPassword('');
    setConfirm('');
    setTouched(false);
    setWrongCurrent(false);
    setError(null);
  }, [visible]);

  const currentError = wrongCurrent
    ? new WrongPasswordError().message
    : passwordProblem(current, 0);
  const passwordError = passwordProblem(password, MIN_PASSWORD_LENGTH);
  const confirmError = confirmPasswordProblem(password, confirm);

  const handleSave = async () => {
    setTouched(true);
    setError(null);
    if (passwordProblem(current, 0) || passwordError || confirmError || busy) return;

    setBusy(true);
    try {
      await changePassword(current, password);
      onRequestClose();
      notify('Password changed', 'Use your new password the next time you sign in.');
    } catch (e) {
      if (e instanceof WrongPasswordError) setWrongCurrent(true);
      else setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      visible={visible}
      onRequestClose={busy ? undefined : onRequestClose}
      title='Change password'
      footer={
        <>
          <Button label='Cancel' variant='grey' onPress={onRequestClose} disabled={busy} />
          <Button
            label={busy ? 'Saving…' : 'Save password'}
            onPress={() => void handleSave()}
            disabled={busy}
          />
        </>
      }
    >
      <View className='mt-4 gap-4'>
        <TextField
          label='Current password'
          value={current}
          onChangeText={value => {
            setCurrent(value);
            setWrongCurrent(false);
          }}
          placeholder='••••••••••'
          invalid={(touched && !!currentError) || wrongCurrent}
          error={currentError ?? undefined}
          secureTextEntry
          autoCapitalize='none'
          autoComplete='current-password'
          textContentType='password'
          returnKeyType='next'
          onSubmitEditing={() => newRef.current?.focus()}
          editable={!busy}
          autoFocus
        />
        <TextField
          ref={newRef}
          label='New password'
          value={password}
          onChangeText={setPassword}
          placeholder='••••••••••'
          invalid={touched && !!passwordError}
          error={passwordError ?? undefined}
          secureTextEntry
          autoCapitalize='none'
          autoComplete='new-password'
          textContentType='newPassword'
          returnKeyType='next'
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!busy}
        />
        <TextField
          ref={confirmRef}
          label='Confirm new password'
          value={confirm}
          onChangeText={setConfirm}
          placeholder='••••••••••'
          invalid={touched && !!confirmError}
          error={confirmError ?? undefined}
          secureTextEntry
          autoCapitalize='none'
          autoComplete='new-password'
          textContentType='newPassword'
          returnKeyType='go'
          onSubmitEditing={() => void handleSave()}
          editable={!busy}
        />

        {!(touched && (passwordError || confirmError)) && (
          <Text className='font-nunito -mt-2 text-[12px] text-ink-subtle'>
            At least {MIN_PASSWORD_LENGTH} characters.
          </Text>
        )}

        {error && (
          <View className='rounded-xl bg-error-lighter px-3 py-2.5'>
            <Text className='font-nunito text-[13px] leading-5 text-error-dark'>{error}</Text>
          </View>
        )}
      </View>
    </ModalShell>
  );
};

export default ChangePasswordModal;
