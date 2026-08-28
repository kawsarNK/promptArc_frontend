import { CreatorProfile } from "./creator-profile";

export default async function CreatorProfilePage({ params }) {
  const { id } = await params;
  return <CreatorProfile id={id} />;
}
