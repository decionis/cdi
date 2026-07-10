import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CdiApiErrorMapper } from "@/infra/api/CdiApiErrorMapper";
import { CdiCompositionRoot } from "@/infra/composition/CdiCompositionRoot";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: accountId } = await params;
    const context = new CdiCompositionRoot().createRequestContext(request);
    return NextResponse.json(await context.accounts.requireAccount(accountId));
  } catch (error) {
    return CdiApiErrorMapper.toResponse(error);
  }
}
