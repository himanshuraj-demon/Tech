import EditMagazinePage from "./edit-page-client";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default function Page() {
  return <EditMagazinePage />;
}
