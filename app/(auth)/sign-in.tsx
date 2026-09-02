import { Pressable, Text, View } from 'react-native';

import AuthForm from '../components/auth/AuthForm';
import Logo from '../icons/Logo';
import ScreenLayout from '../components/ScreenLayout';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth/AuthProvider';

const SignInScreen = () => {
  const { signIn } = useAuth();

  return (
    <ScreenLayout>
      {/* Centred rather than top-aligned: there is no list to anchor to, and the form is
          short enough that a top-aligned one looks stranded on a desktop viewport. */}
      <View className='flex-1 justify-center gap-6 py-8'>
        <View className='items-center gap-3'>
          <Logo size={44} />
          <View className='items-center gap-1'>
            <Text className='text-[26px] font-bold tracking-tight text-ink'>
              Welcome back
            </Text>
            <Text className='text-[14px] text-ink-muted'>Sign in to your network.</Text>
          </View>
        </View>

        {/* The Stack.Protected guard in the root layout swaps the navigator as soon as the
            session lands, so there is nothing to navigate to here. */}
        <AuthForm submitLabel='Sign in' onSubmit={signIn} />

        <View className='items-center'>
          <Pressable
            accessibilityRole='link'
            onPress={() => router.replace('/forgot-password')}
          >
            <Text className='text-[14px] font-semibold text-brand'>
              Forgot your password?
            </Text>
          </Pressable>
        </View>

        <View className='flex-row items-center justify-center gap-1.5'>
          <Text className='text-[14px] text-ink-muted'>New here?</Text>
          <Pressable
            accessibilityRole='link'
            onPress={() => router.replace('/sign-up')}
          >
            <Text className='text-[14px] font-semibold text-brand'>Create an account</Text>
          </Pressable>
        </View>
      </View>
    </ScreenLayout>
  );
};

export default SignInScreen;
