import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CdiApiErrorMapper } from "@/Infrastructure/Api/CdiApiErrorMapper";
import { CdiCompositionRoot } from "@/Infrastructure/Composition/CdiCompositionRoot";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = new CdiCompositionRoot().createRequestContext(request);
    return NextResponse.json(await context.dashboard.getPortfolio());
  } catch (error) {
    return CdiApiErrorMapper.toResponse(error);
  }
}
