import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CdiApiErrorMapper } from "@/Infrastructure/Api/CdiApiErrorMapper";
import { CdiCompositionRoot } from "@/Infrastructure/Composition/CdiCompositionRoot";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> },
) {
  try {
    const { accountId } = await params;
    const context = new CdiCompositionRoot().createRequestContext(request);
    return NextResponse.json(await context.accounts.requireAccount(accountId));
  } catch (error) {
    return CdiApiErrorMapper.toResponse(error);
  }
}
