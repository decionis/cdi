import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CdiApiErrorMapper } from "@/Infrastructure/Api/CdiApiErrorMapper";
import { CdiCompositionRoot } from "@/Infrastructure/Composition/CdiCompositionRoot";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ opportunityId: string }> },
) {
  try {
    const { opportunityId } = await params;
    const context = new CdiCompositionRoot().createRequestContext(request);
    return NextResponse.json(
      await context.opportunities.review(opportunityId, await request.json()),
    );
  } catch (error) {
    return CdiApiErrorMapper.toResponse(error);
  }
}
