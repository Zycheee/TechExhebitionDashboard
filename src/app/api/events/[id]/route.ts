import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const event = await db.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { name: true, email: true, role: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch event: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    const body = await req.json();

    if (body.fitScore < 3) {
      return NextResponse.json(
        { error: "Only events scoring Fit 3+ can be entered." },
        { status: 400 }
      );
    }

    const updatedEvent = await db.event.update({
      where: { id },
      data: {
        region: body.region,
        country: body.country,
        city: body.city,
        eventName: body.eventName,
        dates: body.dates,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        venue: body.venue,
        locationAddress: body.locationAddress,
        officialWebsite: body.officialWebsite,
        organizer: body.organizer,
        eventCategory: body.eventCategory,
        businessLines: JSON.stringify(body.businessLines || []),
        strategicFocus: body.strategicFocus,
        relevanceToLifewood: body.relevanceToLifewood,
        targetAudience: body.targetAudience,
        estimatedAttendees: body.estimatedAttendees,
        exhibitorOpportunity: body.exhibitorOpportunity,
        boothCost: body.boothCost,
        registrationDeadline: body.registrationDeadline,
        contactEmail: body.contactEmail,
        contactPerson: body.contactPerson,
        socialMedia: body.socialMedia,
        participationRec: body.participationRec,
        priorityLevel: body.priorityLevel,
        fitScore: body.fitScore,
        keyNotes: body.keyNotes,
        sourceLinks: JSON.stringify(body.sourceLinks || []),
        status: body.status,
      },
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update event: " + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    const body = await req.json();

    const dataToUpdate: any = {};
    if (typeof body.isAttended === "boolean") {
      dataToUpdate.isAttended = body.isAttended;
      dataToUpdate.attendedAt = body.isAttended ? new Date() : null;
    }
    if (body.status) {
      dataToUpdate.status = body.status;
    }

    const updatedEvent = await db.event.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update attendance status: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required to delete records." },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    await db.event.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete event: " + error.message },
      { status: 500 }
    );
  }
}
