import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceForm, type ServiceFormValues } from "@/components/ServiceForm";
import { requireAdmin } from "@/lib/auth";
import { one, query } from "@/lib/db";

export const metadata = { title: "Edit service · Admin" };

export default async function EditService(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await requireAdmin();
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const [service, categories, providers] = await Promise.all([
    one<ServiceFormValues>("SELECT * FROM services WHERE id = $1", [id]),
    query<{ id: number; name: string }>("SELECT id, name FROM categories ORDER BY sort, id"),
    query<{ id: number; name: string }>("SELECT id, name FROM providers ORDER BY id"),
  ]);
  if (!service) notFound();
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/services" className="small">
            ← Services
          </Link>
          <h1 style={{ marginTop: 6 }}>Edit service #{id}</h1>
        </div>
      </div>
      <div className="card card-body" style={{ maxWidth: 860 }}>
        <ServiceForm values={service} categories={categories} providers={providers} />
      </div>
    </>
  );
}
