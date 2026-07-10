import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CdiApiErrorMapper } from "@/infra/api/CdiApiErrorMapper";
import { CdiCompositionRoot } from "@/infra/composition/CdiCompositionRoot";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = new CdiCompositionRoot().createRequestContext(request);
    return NextResponse.json(await context.dashboard.getPortfolio());
  } catch (error) {
    return CdiApiErrorMapper.toResponse(error);
  }
}
