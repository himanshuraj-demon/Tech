import EditHackathonPage from "./edit-page-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default function Page({ params }: PageProps) {
  return <EditHackathonPage params={params} />;
}
