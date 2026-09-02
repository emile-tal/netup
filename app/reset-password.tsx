import { MIN_PASSWORD_LENGTH, confirmPasswordProblem, passwordProblem } from './utils/authValidation';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRef, useState } from 'react';

import Button from './components/Button';
import Card from './components/Card';
import Logo from './icons/Logo';
import ScreenLayout from './components/ScreenLayout';
import ScreenState from './components/ScreenState';
import TextField from './components/TextField';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth/AuthProvider';

/**
 * Where a password-reset link lands.
 *
 * This route sits *outside* both `Stack.Protected` guards in the root layout, and that is
 * deliberate: following the link establishes a real session, so a screen guarded by
 * "signed out" would be unreachable exactly when it is needed. Unguarded, it works in
 * both states — and doubles as the change-password screen for someone already signed in.
 */
const ResetPasswordScreen = () => {
  const { session, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<TextInput>(null);

  const passwordError = passwordProblem(password, MIN_PASSWORD_LENGTH);
  const confirmError = confirmPasswordProblem(password, confirmPassword);

  const handleSave = async () => {
    setTouched(true);
    setError(null);
    if (passwordError || confirmError || busy) return;

    setBusy(true);
    try {
      await updatePassword(password);
      // The session from the reset link is already a full session, so there is nothing
      // to sign in to — go straight into the app.
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // Hold while the code in the URL is still being exchanged for a session.
  if (loading) {
    return (
      <ScreenLayout>
        <ScreenState loading />
      </ScreenLayout>
    );
  }

  // No session here means the link was never followed, or it expired or was already used.
  if (!session) {
    return (
      <ScreenLayout>
        <View className='flex-1 justify-center gap-6 py-8'>
          <View className='items-center gap-3'>
            <Logo size={44} />
            <Text className='text-[26px] font-bold tracking-tight text-ink'>
              Link expired
            </Text>
          </View>

          <Card>
            <Text className='text-center text-[14px] leading-6 text-ink-muted'>
              Password reset links can only be used once, and they don&apos;t last long.
              Request a fresh one and try again.
            </Text>
          </Card>

          <View className='flex-row items-center justify-center gap-1.5'>
            <Pressable
              accessibilityRole='link'
              onPress={() => router.replace('/forgot-password')}
            >
              <Text className='text-[14px] font-semibold text-brand'>
                Send a new link
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View className='flex-1 justify-center gap-6 py-8'>
        <View className='items-center gap-3'>
          <Logo size={44} />
          <View className='items-center gap-1'>
            <Text className='text-[26px] font-bold tracking-tight text-ink'>
              Set a new password
            </Text>
            <Text className='text-[14px] text-ink-muted'>{session.user.email}</Text>
          </View>
        </View>

        <Card className='gap-4'>
          <TextField
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
            autoFocus
          />

          <TextField
            ref={confirmRef}
            label='Confirm new password'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            <Text className='-mt-2 text-[12px] text-ink-subtle'>
              At least {MIN_PASSWORD_LENGTH} characters.
            </Text>
          )}

          {error && (
            <View className='rounded-xl bg-danger-light px-3 py-2.5'>
              <Text className='text-[13px] leading-5 text-danger'>{error}</Text>
            </View>
          )}

          <Button
            label={busy ? 'Saving…' : 'Save password'}
            onPress={() => void handleSave()}
            disabled={busy}
            fullWidth
          />
        </Card>
      </View>
    </ScreenLayout>
  );
};

export default ResetPasswordScreen;
