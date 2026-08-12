import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";

export default function AdminProductNewPage() {
  return (
    <>
      <header className="km-admin__head">
        <div>
          <nav className="km-crumbs" aria-label="Breadcrumb">
            <Link href="/admin/products">Products</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">New product</span>
          </nav>
          <h1 className="km-admin__title">New product</h1>
          <p className="km-admin__sub">Add a piece to the catalogue.</p>
        </div>
      </header>
      <ProductForm />
    </>
  );
}
