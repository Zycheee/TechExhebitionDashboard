import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const region = searchParams.get("region");
    const businessLine = searchParams.get("businessLine");
    const fitScore = searchParams.get("fitScore");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const isAttendedParam = searchParams.get("isAttended");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (isAttendedParam === "true") {
      where.isAttended = true;
    } else if (isAttendedParam === "false") {
      where.isAttended = false;
    }

    if (region && region !== "ALL") {
      where.region = region;
    }

    if (priority && priority !== "ALL") {
      where.priorityLevel = priority;
    }

    if (fitScore && fitScore !== "ALL") {
      const scores = fitScore.split(",").map(Number);
      where.fitScore = { in: scores };
    }

    if (status && status !== "ALL") {
      where.status = status;
    } else {
      where.status = "PUBLISHED";
    }

    if (search && search.trim() !== "") {
      const query = search.trim();
      where.OR = [
        { eventName: { contains: query } },
        { city: { contains: query } },
        { country: { contains: query } },
        { venue: { contains: query } },
        { organizer: { contains: query } },
      ];
    }

    // Fetch events
    let events = await db.event.findMany({
      where,
      orderBy: { startDate: "asc" },
      skip,
      take: limit,
      include: {
        createdBy: {
          select: { name: true, role: true },
        },
      },
    });

    // Client side filter for JSON string businessLines array
    if (businessLine && businessLine !== "ALL") {
      events = events.filter((evt) => {
        try {
          const lines: string[] = JSON.parse(evt.businessLines);
          return lines.some(
            (l) => l.toLowerCase() === businessLine.toLowerCase()
          );
        } catch {
          return evt.businessLines.includes(businessLine);
        }
      });
    }

    const totalCount = await db.event.count({ where });

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch events: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Fit score validation rule (minimum score 3 enforced)
    if (body.fitScore < 3) {
      return NextResponse.json(
        { error: "Only events scoring Fit 3+ can be entered into the database." },
        { status: 400 }
      );
    }

    // Get max eventNumber
    const maxEvent = await db.event.findFirst({
      orderBy: { eventNumber: "desc" },
    });
    const nextNumber = (maxEvent?.eventNumber || 0) + 1;

    const userRole = (session.user as any).role || "INTERN";
    // Interns submit as DRAFT / PENDING_REVIEW; Admin & Supervisor submit as PUBLISHED
    const initialStatus =
      userRole === "INTERN" ? "PENDING_REVIEW" : body.status || "PUBLISHED";

    const newEvent = await db.event.create({
      data: {
        eventNumber: nextNumber,
        region: body.region,
        country: body.country,
        city: body.city,
        eventName: body.eventName,
        dates: body.dates,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        venue: body.venue,
        locationAddress: body.locationAddress || "",
        officialWebsite: body.officialWebsite,
        organizer: body.organizer,
        eventCategory: body.eventCategory,
        businessLines: JSON.stringify(body.businessLines || []),
        strategicFocus: body.strategicFocus,
        relevanceToLifewood: body.relevanceToLifewood,
        targetAudience: body.targetAudience,
        estimatedAttendees: body.estimatedAttendees || "Not publicly disclosed",
        exhibitorOpportunity: body.exhibitorOpportunity || "Not publicly disclosed",
        boothCost: body.boothCost || "Not publicly disclosed",
        registrationDeadline: body.registrationDeadline || "Not publicly disclosed",
        contactEmail: body.contactEmail || "Not publicly disclosed",
        contactPerson: body.contactPerson || "Not publicly disclosed",
        socialMedia: body.socialMedia || "Not publicly disclosed",
        participationRec: body.participationRec,
        priorityLevel: body.priorityLevel || "Medium",
        fitScore: body.fitScore,
        keyNotes: body.keyNotes || "",
        sourceLinks: JSON.stringify(body.sourceLinks || []),
        status: initialStatus,
        source: "MANUAL",
        createdById: parseInt((session.user as any).id),
      },
    });

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create event: " + error.message },
      { status: 500 }
    );
  }
}
