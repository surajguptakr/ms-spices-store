import type { Metadata } from "next";
import { notFound } from "next/navigation";

const policyInfo: Record<string, { title: string; key: string; fallback: string }> = {
  shipping: { title: "Shipping", key: "shippingPolicy", fallback: "Orders are packed fresh and dispatched within 2-3 working days. Delivery usually takes 4-7 working days depending on your PIN code. Free delivery applies to orders over Rs. 999." },
  returns: { title: "Returns & quality", key: "returnsPolicy", fallback: "For quality concerns, contact us within 48 hours of delivery with your order number and clear photos. We will work with you on a replacement or refund." },
  privacy: { title: "Privacy", key: "privacyPolicy", fallback: "We use your contact and delivery details only to process your order and provide customer support. We do not sell personal information." },
  terms: { title: "Terms of service", key: "termsPolicy", fallback: "Product availability and prices may change. Orders are confirmed after stock verification. Cash on delivery is available at eligible PIN codes." },
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: policyInfo[slug]?.title ?? "Policies" };
}

export default async function PolicyPage({ params }: PageProps) {
  const { slug } = await params;
  const policy = policyInfo[slug];
  if (!policy) notFound();
  let copy = policy.fallback;
  try {
    const { prisma } = await import("@/lib/prisma");
    const setting = await prisma.setting.findUnique({ where: { key: policy.key } });
    if (setting?.value) copy = setting.value;
  } catch { /* Display the published policy copy if the database is not connected. */ }
  return <main className="policy-page section-shell page-top"><span className="eyebrow-light">The details matter</span><h1 className="page-heading">{policy.title}.</h1><p className="policy-copy">{copy}</p></main>;
}