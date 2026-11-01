export type PostalLookup = { pinCode: string; city: string; state: string };

export async function lookupDeliveryPin(pinCode: string): Promise<PostalLookup | null> {
  if (!/^[1-9]\d{5}$/.test(pinCode)) return null;
  const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error("Postal service lookup failed.");
  const payload: Array<{ Status?: string; PostOffice?: Array<{ Name?: string; District?: string; State?: string; DeliveryStatus?: string }> | null }> = await response.json();
  const record = payload[0];
  const office = record?.Status === "Success" ? record.PostOffice?.find((item) => item.DeliveryStatus === "Delivery") : undefined;
  if (!office?.District || !office.State) return null;
  return { pinCode, city: office.District, state: office.State };
}