import Link from "next/link";
import { ServiceForm } from "@/components/ServiceForm";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata = { title: "New service · Admin" };

export default async function NewService() {
  await requireAdmin();
  const [categories, providers] = await Promise.all([
    query<{ id: number; name: string }>("SELECT id, name FROM categories ORDER BY sort, id"),
    query<{ id: number; name: string }>("SELECT id, name FROM providers ORDER BY id"),
  ]);
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/services" className="small">
            ← Services
          </Link>
          <h1 style={{ marginTop: 6 }}>New service</h1>
        </div>
      </div>
      <div className="card card-body" style={{ maxWidth: 860 }}>
        {categories.length ? (
          <ServiceForm values={{}} categories={categories} providers={providers} />
        ) : (
          <p>
            Create a category first on the <Link href="/admin/services">services page</Link>.
          </p>
        )}
      </div>
    </>
  );
}
