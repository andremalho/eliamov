import AppRouter from './router';
import { GamificationProvider } from './contexts/GamificationContext';
import GamificationToast from './components/GamificationToast';
import { MedicationsButton } from './components/MedicationsButton';

export default function App() {
  return (
    <GamificationProvider>
      <AppRouter />
      <GamificationToast />
      <MedicationsButton />
    </GamificationProvider>
  );
}
