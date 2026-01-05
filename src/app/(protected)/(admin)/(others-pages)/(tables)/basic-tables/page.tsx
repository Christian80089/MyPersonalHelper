import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SalaryTable from "@/components/tables/SalaryTable";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default async function BasicTables() {
  const supabase = await createClient();
  const { data: tableData, error } = await supabase
    .from("Salary")
    .select("*")
    .order('data_busta_paga', { ascending: false })
    .limit(50);

  if (error) {
    console.error('💥 Error Salary:', error);
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <SalaryTable tableData={tableData || []} />
        </ComponentCard>
      </div>
    </div>
  );
}
