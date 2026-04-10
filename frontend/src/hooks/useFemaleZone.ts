import { useAuth } from '../contexts/AuthContext';

export function useFemaleZone() {
  const { currentUser } = useAuth();

  const isFemale = currentUser?.role === 'female_user' || currentUser?.role === 'user';

  return {
    isFemale,
    showBlockedModal: !isFemale && !!currentUser,
    userName: currentUser?.name ?? '',
    userRole: currentUser?.role ?? '',
  };
}
