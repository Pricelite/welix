import { AuthScreen } from "@/components/AuthScreen";

type ConnexionPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const params = searchParams ? await searchParams : undefined;

  return <AuthScreen mode="connexion" errorCode={params?.error} />;
}
