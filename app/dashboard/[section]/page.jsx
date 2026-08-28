import { Dashboard } from "@/components/dashboard";
export default async function DashboardSectionPage({ params }) { const { section } = await params; return <Dashboard section={section}/>; }

