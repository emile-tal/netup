import { Text, TextInput, View } from 'react-native';
import { useRef, useState } from 'react';

import Button from '../Button';
import Card from '../Card';
import TextField from '../TextField';

interface AuthFormProps {
  submitLabel: string;
  /** Rejects with an Error whose message is shown inline. */
  onSubmit: (email: string, password: string) => Promise<void>;
  /**
   * Minimum password length enforced before we call the server. Sign-up passes the
   * project's policy so the user gets an inline hint instead of a round trip; sign-in
   * passes 0, because an existing password may predate the current policy.
   */
  minPasswordLength?: number;
  passwordHint?: string;
}

/** Rough shape check only — the server is the authority on whether an address exists. */
const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/**
 * The shared email + password form behind both auth screens. Owns its own field state,
 * validation and busy/error handling so the screens stay declarative.
 */
const AuthForm = ({
  submitLabel,
  onSubmit,
  minPasswordLength = 0,
  passwordHint,
}: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  const emailError = !looksLikeEmail(email) ? 'Enter a valid email address' : null;
  const passwordError =
    password.length < Math.max(minPasswordLength, 1)
      ? minPasswordLength > 1
        ? `Use at least ${minPasswordLength} characters`
        : 'Enter your password'
      : null;

  const handleSubmit = async () => {
    setTouched(true);
    setError(null);
    if (emailError || passwordError || busy) return;

    setBusy(true);
    try {
      await onSubmit(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className='gap-4'>
      <TextField
        label='Email'
        value={email}
        onChangeText={setEmail}
        placeholder='you@example.com'
        invalid={touched && !!emailError}
        error={emailError ?? undefined}
        keyboardType='email-address'
        autoCapitalize='none'
        autoComplete='email'
        textContentType='emailAddress'
        returnKeyType='next'
        onSubmitEditing={() => passwordRef.current?.focus()}
        editable={!busy}
      />

      <TextField
        ref={passwordRef}
        label='Password'
        value={password}
        onChangeText={setPassword}
        placeholder='••••••••••'
        invalid={touched && !!passwordError}
        error={passwordError ?? undefined}
        secureTextEntry
        autoCapitalize='none'
        autoComplete='password'
        textContentType='password'
        returnKeyType='go'
        onSubmitEditing={() => void handleSubmit()}
        editable={!busy}
      />

      {passwordHint && !(touched && passwordError) && (
        <Text className='-mt-2 text-[12px] text-ink-subtle'>{passwordHint}</Text>
      )}

      {error && (
        <View className='rounded-xl bg-danger-light px-3 py-2.5'>
          <Text className='text-[13px] leading-5 text-danger'>{error}</Text>
        </View>
      )}

      <Button
        label={busy ? 'Please wait…' : submitLabel}
        onPress={() => void handleSubmit()}
        disabled={busy}
        fullWidth
      />
    </Card>
  );
};

export default AuthForm;
