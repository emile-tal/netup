import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import Button from '../components/Button';
import Logo from '../icons/Logo';
import ScreenLayout from '../components/ScreenLayout';
import { completeOnboarding } from '@/db/repo/profile';
import { notify } from '../utils/alert';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useDB } from '@/db/dbProvider';
import { useEffect, useState } from 'react';

/** Shared by all three headline lines, so they can't drift apart. */
const HEADLINE =
  'text-center text-[44px] leading-[54px] tracking-tight md:text-[52px] md:leading-[62px]';

/**
 * The last page of setup: what netup is for, then the way in.
 *
 * Deliberately the whole page with no `Card` and no header — it is a statement, not
 * another form, so the only thing competing for attention is the one action.
 */
const WelcomeScreen = () => {
  const db = useDB();
  const { user } = useAuth();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const [saving, setSaving] = useState(false);

  // Reached directly — a deep link, or a reload that dropped the param. There is nothing
  // to save without it, so send the user back to the question.
  useEffect(() => {
    if (!name?.trim()) router.replace('/name');
  }, [name]);

  const handleStart = async () => {
    if (saving || !user || !name?.trim()) return;

    setSaving(true);
    try {
      // Writing the row locally is what flips the gate: `observeProfile` emits, `onboarded`
      // becomes true, and the guard swaps `(onboarding)` out for the app. The push to the
      // server happens behind the user via the outbox.
      await completeOnboarding(db, user.id, name.trim());
      // The guard picks the screen; this only fixes the address bar, so a reloading web
      // user is not left on a route that no longer exists.
      router.replace('/');
    } catch (error) {
      console.error('Error finishing setup:', error);
      notify('Could not save', 'Your name was not saved. Please try again.');
      setSaving(false);
    }
  };

  return (
    <ScreenLayout>
      <View className='flex-1 items-center justify-center gap-10'>
        {/* The mark and the wordmark, which is the one place "Up" carries the accent. */}
        <View className='flex-row items-center gap-2'>
          <Logo size={40} />
          <Text className='font-nunito text-[30px] tracking-tight text-ink'>
            Net<Text className='font-nunito text-brand'>Up</Text>
          </Text>
        </View>

        {/* Three lines rather than one wrapped string: the breaks are the design's, and
            "career." earns its own line as the payoff. */}
        <View>
          <Text className={`font-nunito ${HEADLINE} text-ink`}>Your network</Text>
          <Text className={`font-nunito ${HEADLINE} text-ink`}>is your</Text>
          <Text className={`font-nunito ${HEADLINE} text-brand`}>career.</Text>
        </View>

        <View className='gap-1'>
          <Text className='font-nunito text-center text-[16px] leading-6 text-ink-muted'>
            Most opportunities never get posted.
          </Text>
          <Text className='font-nunito text-center text-[16px] leading-6 text-ink-muted'>
            NetUp helps you stay in the rooms where they happen.
          </Text>
        </View>

        {/* `Button` hugs its label with `self-start`, so the centring lives on a wrapper
            rather than fighting that. */}
        <View className='w-full max-w-[280px]'>
          <Button
            label={saving ? 'Setting up…' : 'Get started  →'}
            onPress={() => void handleStart()}
            disabled={saving}
            fullWidth
          />
        </View>
      </View>
    </ScreenLayout>
  );
};

export default WelcomeScreen;
