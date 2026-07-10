import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CdiApiErrorMapper } from "@/infra/api/CdiApiErrorMapper";
import { CdiCompositionRoot } from "@/infra/composition/CdiCompositionRoot";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: opportunityId } = await params;
    const context = new CdiCompositionRoot().createRequestContext(request);
    return NextResponse.json(
      await context.opportunities.review(opportunityId, await request.json()),
    );
  } catch (error) {
    return CdiApiErrorMapper.toResponse(error);
  }
}
