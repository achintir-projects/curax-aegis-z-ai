import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

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

    const vitalSigns = await db.vitalSign.findMany({
      where: {
        familyMember: {
          familyId: familyId
        }
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
        recordedAt: 'desc'
      },
      take: 100 // Limit to last 100 vital sign readings
    })

    return NextResponse.json(vitalSigns)
  } catch (error) {
    console.error('Error fetching vital signs:', error)
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
    const { type, value, unit, familyMemberId, notes } = body

    if (!type || !value || !unit || !familyMemberId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the family member exists and user has access
    const member = await db.familyMember.findFirst({
      where: {
        id: familyMemberId,
        family: {
          OR: [
            { createdById: session.user.id },
            { members: { some: { userId: session.user.id } } }
          ]
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const vitalSign = await db.vitalSign.create({
      data: {
        type,
        value: parseFloat(value),
        unit,
        familyMemberId,
        notes,
        recordedAt: new Date()
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

    return NextResponse.json(vitalSign, { status: 201 })
  } catch (error) {
    console.error('Error creating vital sign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}