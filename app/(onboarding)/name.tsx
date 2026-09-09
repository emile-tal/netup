import { Text, View } from 'react-native';

import Button from '../components/Button';
import Logo from '../icons/Logo';
import ScreenLayout from '../components/ScreenLayout';
import TextField from '../components/TextField';
import { router } from 'expo-router';
import { useState } from 'react';

/**
 * First page of setup. One question, so the screen asks exactly one thing — no header, no
 * back control, nothing to skip to.
 *
 * The name travels to the next screen as a route param rather than through a store: two
 * screens share one value, and it survives going back and forward between them.
 */
const NameScreen = () => {
  const [name, setName] = useState('');
  const trimmed = name.trim();

  const handleContinue = () => {
    if (!trimmed) return;
    router.push({ pathname: '/welcome', params: { name: trimmed } });
  };

  return (
    <ScreenLayout>
      <View className='flex-1 justify-center gap-8'>
        <View className='items-center'>
          <Logo size={48} />
        </View>

        <View className='gap-2'>
          <Text className='text-[28px] font-bold tracking-tight text-ink'>
            What&apos;s your name?
          </Text>
          <Text className='text-[15px] leading-6 text-ink-muted'>
            It&apos;s how netup will greet you. You can change it later.
          </Text>
        </View>

        <View className='gap-4'>
          <TextField
            label='Name'
            placeholder='Alex Rivera'
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize='words'
            autoComplete='name'
            textContentType='name'
            returnKeyType='next'
            onSubmitEditing={handleContinue}
          />
          <Button
            label='Continue'
            onPress={handleContinue}
            disabled={!trimmed}
            fullWidth
          />
        </View>
      </View>
    </ScreenLayout>
  );
};

export default NameScreen;
