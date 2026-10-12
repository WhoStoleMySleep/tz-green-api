import { LoginScreen } from "./components/LoginScreen";
import { Messenger } from "./components/Messenger";
import { useAuthStore } from "./stores/auth";

export default function App() {
  const signedIn = useAuthStore((state) => Boolean(state.credentials));
  return signedIn ? <Messenger /> : <LoginScreen />;
}
