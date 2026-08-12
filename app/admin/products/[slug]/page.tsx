import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/commerce/catalog";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function AdminProductEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <header className="km-admin__head">
        <div>
          <nav className="km-crumbs" aria-label="Breadcrumb">
            <Link href="/admin/products">Products</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>
          <h1 className="km-admin__title">{product.name}</h1>
        </div>
      </header>
      <ProductForm product={product} />
    </>
  );
}
