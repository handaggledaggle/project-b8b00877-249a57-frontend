import PaymentStatusClient from "./payment-status-client";

export default async function PaymentStatusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const orderIdRaw = sp.orderId;
  const orderId =
    typeof orderIdRaw === "string" && orderIdRaw.trim().length > 0
      ? orderIdRaw
      : "ORD-20260306-12345";

  return <PaymentStatusClient orderId={orderId} />;
}
