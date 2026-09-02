import { Pressable, Text, View } from 'react-native';

import AuthForm from '../components/auth/AuthForm';
import Card from '../components/Card';
import Logo from '../icons/Logo';
import ScreenLayout from '../components/ScreenLayout';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useState } from 'react';

/** Keep in step with the project's password policy (Auth → Policies → Passwords). */
const MIN_PASSWORD_LENGTH = 10;

const SignUpScreen = () => {
  const { signUp } = useAuth();
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);

  if (confirmationSentTo) {
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
            <Text className='text-center text-[14px] leading-6 text-ink-muted'>
              We sent a confirmation link to{' '}
              <Text className='font-semibold text-ink'>{confirmationSentTo}</Text>. Open it
              to finish setting up your account, then come back and sign in.
            </Text>
          </Card>

          <View className='flex-row items-center justify-center gap-1.5'>
            <Text className='text-[14px] text-ink-muted'>Already confirmed?</Text>
            <Pressable
              accessibilityRole='link'
              onPress={() => router.replace('/sign-in')}
            >
              <Text className='text-[14px] font-semibold text-brand'>Sign in</Text>
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
              Create your account
            </Text>
            <Text className='text-[14px] text-ink-muted'>
              Your network, on every device.
            </Text>
          </View>
        </View>

        <AuthForm
          submitLabel='Create account'
          minPasswordLength={MIN_PASSWORD_LENGTH}
          passwordHint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          onSubmit={async (email, password) => {
            // When the project requires email confirmation there is no session yet, so
            // the guard will not swap the navigator — show the inbox state instead.
            const { needsConfirmation } = await signUp(email, password);
            if (needsConfirmation) setConfirmationSentTo(email.trim());
          }}
        />

        <View className='flex-row items-center justify-center gap-1.5'>
          <Text className='text-[14px] text-ink-muted'>Already have an account?</Text>
          <Pressable
            accessibilityRole='link'
            onPress={() => router.replace('/sign-in')}
          >
            <Text className='text-[14px] font-semibold text-brand'>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </ScreenLayout>
  );
};

export default SignUpScreen;
