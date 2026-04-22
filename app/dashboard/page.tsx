import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { redirect } from "next/navigation";
import {
  supabase,
  type CreatorRow,
  type BrandRow,
  type ConversationPreview,
  type AgreementEntry,
} from "@/lib/supabase";
import { DashboardClient } from "./dashboard-client";
import { AdminClient } from "./admin-client";
import { BrandDashboardClient } from "./brand-dashboard-client";

async function fetchBrandPreviews(brandId: string): Promise<ConversationPreview[]> {
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, creator_id, last_message_at, last_message_preview")
    .eq("brand_id", brandId)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (!convs || convs.length === 0) return [];
  const { data: creators } = await supabase
    .from("creators")
    .select("id, full_name, display_name, profile_picture_url")
    .in(
      "id",
      convs.map((c) => c.creator_id)
    );
  const map = new Map(
    (creators ?? []).map((c) => [
      c.id as string,
      {
        name: (c.display_name as string | null) ?? (c.full_name as string),
        imageUrl: c.profile_picture_url as string | null,
      },
    ])
  );
  return convs.map((c) => {
    const info = map.get(c.creator_id as string);
    return {
      conversationId: c.id as string,
      counterpartyName: info?.name ?? "Creator",
      counterpartyImageUrl: info?.imageUrl ?? null,
      lastMessage: (c.last_message_preview as string | null) ?? null,
      lastMessageAt: (c.last_message_at as string | null) ?? null,
    };
  });
}

async function fetchCreatorPreviews(
  creatorId: string
): Promise<ConversationPreview[]> {
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, brand_id, last_message_at, last_message_preview")
    .eq("creator_id", creatorId)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (!convs || convs.length === 0) return [];
  const { data: brands } = await supabase
    .from("brands")
    .select("id, business_name")
    .in(
      "id",
      convs.map((c) => c.brand_id)
    );
  const map = new Map(
    (brands ?? []).map((b) => [
      b.id as string,
      { name: b.business_name as string },
    ])
  );
  return convs.map((c) => {
    const info = map.get(c.brand_id as string);
    return {
      conversationId: c.id as string,
      counterpartyName: info?.name ?? "Brand",
      counterpartyImageUrl: null,
      lastMessage: (c.last_message_preview as string | null) ?? null,
      lastMessageAt: (c.last_message_at as string | null) ?? null,
    };
  });
}

async function fetchAgreements(): Promise<AgreementEntry[]> {
  const { data: convs } = await supabase
    .from("conversations")
    .select(
      "id, brand_id, creator_id, brand_agreed_long, brand_agreed_long_at, brand_agreed_short, brand_agreed_short_at, creator_agreed_long, creator_agreed_long_at, creator_agreed_short, creator_agreed_short_at"
    )
    .or(
      "brand_agreed_long.eq.true,brand_agreed_short.eq.true,creator_agreed_long.eq.true,creator_agreed_short.eq.true"
    );
  if (!convs || convs.length === 0) return [];

  const brandIds = Array.from(new Set(convs.map((c) => c.brand_id as string)));
  const creatorIds = Array.from(
    new Set(convs.map((c) => c.creator_id as string))
  );

  const [{ data: brandsData }, { data: creatorsData }] = await Promise.all([
    supabase.from("brands").select("id, business_name").in("id", brandIds),
    supabase
      .from("creators")
      .select("id, full_name, display_name")
      .in("id", creatorIds),
  ]);

  const brandMap = new Map(
    (brandsData ?? []).map((b) => [
      b.id as string,
      (b.business_name as string | null) ?? "Brand",
    ])
  );
  const creatorMap = new Map(
    (creatorsData ?? []).map((c) => [
      c.id as string,
      (c.display_name as string | null) ??
        (c.full_name as string | null) ??
        "Creator",
    ])
  );

  const entries: AgreementEntry[] = [];
  for (const c of convs) {
    const base = {
      conversationId: c.id as string,
      brandId: c.brand_id as string,
      creatorId: c.creator_id as string,
      brandName: brandMap.get(c.brand_id as string) ?? "Brand",
      creatorName: creatorMap.get(c.creator_id as string) ?? "Creator",
    };
    if (c.brand_agreed_long)
      entries.push({
        ...base,
        who: "brand",
        format: "long",
        agreedAt: (c.brand_agreed_long_at as string) ?? "",
      });
    if (c.brand_agreed_short)
      entries.push({
        ...base,
        who: "brand",
        format: "short",
        agreedAt: (c.brand_agreed_short_at as string) ?? "",
      });
    if (c.creator_agreed_long)
      entries.push({
        ...base,
        who: "creator",
        format: "long",
        agreedAt: (c.creator_agreed_long_at as string) ?? "",
      });
    if (c.creator_agreed_short)
      entries.push({
        ...base,
        who: "creator",
        format: "short",
        agreedAt: (c.creator_agreed_short_at as string) ?? "",
      });
  }

  entries.sort((a, b) => (a.agreedAt < b.agreedAt ? 1 : -1));
  return entries;
}

export const metadata: Metadata = {
  title: "Dashboard · Inlook",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  const isAdmin = role === "admin";
  const isBrand = role === "brand";

  if (isAdmin) {
    const [{ data: creators }, { data: brands }, agreements] =
      await Promise.all([
        supabase
          .from("creators")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("brands")
          .select("*")
          .order("created_at", { ascending: false }),
        fetchAgreements(),
      ]);

    return (
      <AdminClient
        creators={(creators as CreatorRow[]) ?? []}
        brands={(brands as BrandRow[]) ?? []}
        agreements={agreements}
      />
    );
  }

  if (isBrand) {
    let { data: brand } = await supabase
      .from("brands")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    if (!brand) {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      if (email) {
        const { data: linked } = await supabase
          .from("brands")
          .update({ clerk_user_id: userId })
          .eq("email", email)
          .is("clerk_user_id", null)
          .select("*")
          .single();

        if (linked) {
          brand = linked;
          if (linked.business_name) {
            try {
              const clerk = createClerkClient({
                secretKey: process.env.CLERK_SECRET_KEY!,
              });
              await clerk.users.updateUser(userId, {
                firstName: linked.business_name,
              });
            } catch (err) {
              console.error("[dashboard] Clerk brand name sync failed:", err);
            }
          }
        }
      }
    }

    const conversations = brand
      ? await fetchBrandPreviews(brand.id as string)
      : [];

    return (
      <BrandDashboardClient
        userName={
          brand?.business_name ??
          user?.firstName ??
          user?.emailAddresses?.[0]?.emailAddress ??
          "Brand"
        }
        brand={(brand as BrandRow) ?? null}
        conversations={conversations}
      />
    );
  }

  let { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!creator) {
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (email) {
      const { data: linked } = await supabase
        .from("creators")
        .update({ clerk_user_id: userId })
        .eq("email", email)
        .is("clerk_user_id", null)
        .select("*")
        .single();

      if (linked) {
        creator = linked;
        const [firstName, ...rest] = (linked.full_name ?? "").trim().split(/\s+/);
        if (firstName) {
          try {
            const clerk = createClerkClient({
              secretKey: process.env.CLERK_SECRET_KEY!,
            });
            await clerk.users.updateUser(userId, {
              firstName,
              lastName: rest.join(" ") || undefined,
            });
          } catch (err) {
            console.error("[dashboard] Clerk name sync failed:", err);
          }
        }
      }
    }
  }

  const conversations = creator
    ? await fetchCreatorPreviews(creator.id as string)
    : [];

  return (
    <DashboardClient
      userName={user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "Creator"}
      userImageUrl={user?.imageUrl ?? ""}
      clerkUserId={userId}
      creator={(creator as CreatorRow) ?? null}
      conversations={conversations}
    />
  );
}
