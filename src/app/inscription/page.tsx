import { AuthScreen } from "@/components/AuthScreen";

type InscriptionPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function InscriptionPage({ searchParams }: InscriptionPageProps) {
  const params = searchParams ? await searchParams : undefined;

  return <AuthScreen mode="inscription" errorCode={params?.error} />;
}
