import { Alert } from 'react-native';

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong. Please try again.';
}

export function showError(e: unknown) {
  Alert.alert('Couldn’t do that', errorMessage(e));
}
