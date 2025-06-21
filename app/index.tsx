import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(feature2)");
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
