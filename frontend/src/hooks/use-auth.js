import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/api-client";
function useAuth() {
  const [user, setUser] = useState(void 0);
  useEffect(() => {
    const refresh = () => void fetchMe().then(setUser);
    refresh();
    window.addEventListener("aerovista-auth", refresh);
    return () => window.removeEventListener("aerovista-auth", refresh);
  }, []);
  return user;
}
export { useAuth };
