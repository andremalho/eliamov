import AppRouter from './router';
import { GamificationProvider } from './contexts/GamificationContext';
import GamificationToast from './components/GamificationToast';

export default function App() {
  return (
    <GamificationProvider>
      <AppRouter />
      <GamificationToast />
    </GamificationProvider>
  );
}
