import { useSignOut } from '@kit/supabase';
import { Button, Text } from '@kit/ui';

export function SignOutButton() {
  const signOutMutation = useSignOut();

  return (
    <Button
      variant={'destructive'}
      className={'mt-auto'}
      onPress={() => signOutMutation.mutate()}
    >
      <Text>Sign Out</Text>
    </Button>
  );
}
