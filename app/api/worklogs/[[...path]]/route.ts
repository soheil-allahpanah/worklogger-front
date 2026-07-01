import { NextResponse } from "next/server";
import {
  ApiError,
  InputParseError,
  UnauthenticatedError,
} from "@/src/entities/errors/app-error";
import {
  ensureAccessToken,
} from "@/src/infrastructure/auth/cookies";
import { filterWorklogsController } from "@/src/interface-adapters/worklogs/filter-worklog.controller";
import { createWorklogController } from "@/src/interface-adapters/worklogs/create-worklog.controller";
import { getWorklogController } from "@/src/interface-adapters/worklogs/get-worklog.controller";
import { deleteWorklogController } from "@/src/interface-adapters/worklogs/delete-worklog.controller";

function handleError(error: unknown) {
  if (error instanceof UnauthenticatedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof InputParseError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: 400 },
    );
  }
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  const accessToken = await ensureAccessToken();

  try {
    if (path.length === 1 && path[0] === "filter") {
      const body = await request.json();
      const result = await filterWorklogsController(body, accessToken);
      return NextResponse.json(result);
    }

    if (path.length === 0) {
      const body = await request.json();
      const result = await createWorklogController(body, accessToken);
      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  const accessToken = await ensureAccessToken();

  try {
    if (path.length === 1) {
      const result = await getWorklogController(path[0], accessToken);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  const accessToken = await ensureAccessToken();

  try {
    if (path.length === 1) {
      await deleteWorklogController(path[0], accessToken);
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return handleError(error);
  }
}
