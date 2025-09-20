import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { HealthEvent } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const familyId = searchParams.get('familyId')

    if (!familyId) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 })
    }

    // Verify user has access to this family
    const family = await db.family.findFirst({
      where: {
        id: familyId,
        OR: [
          { createdById: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      }
    })

    if (!family) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const events = await db.healthEvent.findMany({
      where: {
        familyId: familyId
      },
      include: {
        familyMember: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        eventDate: 'desc'
      },
      take: 50 // Limit to last 50 events
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching health events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, type, eventDate, familyId, familyMemberId } = body

    if (!title || !type || !eventDate || !familyId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user has access to this family
    const family = await db.family.findFirst({
      where: {
        id: familyId,
        OR: [
          { createdById: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      }
    })

    if (!family) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // If familyMemberId is provided, verify it belongs to the family
    if (familyMemberId) {
      const member = await db.familyMember.findFirst({
        where: {
          id: familyMemberId,
          familyId: familyId
        }
      })

      if (!member) {
        return NextResponse.json({ error: 'Invalid family member' }, { status: 400 })
      }
    }

    const event = await db.healthEvent.create({
      data: {
        title,
        description,
        type,
        eventDate: new Date(eventDate),
        familyId,
        familyMemberId
      },
      include: {
        familyMember: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating health event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}