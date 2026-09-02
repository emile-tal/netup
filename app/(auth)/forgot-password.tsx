import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';

import Button from '../components/Button';
import Card from '../components/Card';
import Logo from '../icons/Logo';
import ScreenLayout from '../components/ScreenLayout';
import TextField from '../components/TextField';
import { emailProblem } from '../utils/authValidation';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth/AuthProvider';

const ForgotPasswordScreen = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const fieldError = emailProblem(email);

  const handleSend = async () => {
    setTouched(true);
    setError(null);
    if (fieldError || busy) return;

    setBusy(true);
    try {
      await sendPasswordReset(email);
      setSentTo(email.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (sentTo) {
    return (
      <ScreenLayout>
        <View className='flex-1 justify-center gap-6 py-8'>
          <View className='items-center gap-3'>
            <Logo size={44} />
            <Text className='text-[26px] font-bold tracking-tight text-ink'>
              Check your inbox
            </Text>
          </View>

          <Card className='gap-2'>
            {/* Deliberately not "if an account exists" — Supabase returns success either
                way, so promising a delivered email we cannot confirm would be a lie. */}
            <Text className='text-center text-[14px] leading-6 text-ink-muted'>
              If <Text className='font-semibold text-ink'>{sentTo}</Text> has an account,
              a reset link is on its way. The link opens netup and lets you set a new
              password.
            </Text>
          </Card>

          <View className='flex-row items-center justify-center gap-1.5'>
            <Pressable
              accessibilityRole='link'
              onPress={() => router.replace('/sign-in')}
            >
              <Text className='text-[14px] font-semibold text-brand'>
                Back to sign in
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
              Reset your password
            </Text>
            <Text className='px-6 text-center text-[14px] leading-6 text-ink-muted'>
              We&apos;ll email you a link to set a new one.
            </Text>
          </View>
        </View>

        <Card className='gap-4'>
          <TextField
            label='Email'
            value={email}
            onChangeText={setEmail}
            placeholder='you@example.com'
            invalid={touched && !!fieldError}
            error={fieldError ?? undefined}
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
            textContentType='emailAddress'
            returnKeyType='go'
            onSubmitEditing={() => void handleSend()}
            editable={!busy}
          />

          {error && (
            <View className='rounded-xl bg-danger-light px-3 py-2.5'>
              <Text className='text-[13px] leading-5 text-danger'>{error}</Text>
            </View>
          )}

          <Button
            label={busy ? 'Sending…' : 'Send reset link'}
            onPress={() => void handleSend()}
            disabled={busy}
            fullWidth
          />
        </Card>

        <View className='flex-row items-center justify-center gap-1.5'>
          <Text className='text-[14px] text-ink-muted'>Remembered it?</Text>
          <Pressable accessibilityRole='link' onPress={() => router.replace('/sign-in')}>
            <Text className='text-[14px] font-semibold text-brand'>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </ScreenLayout>
  );
};

export default ForgotPasswordScreen;
