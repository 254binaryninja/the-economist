import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { serverContainer } from '@/src/config/inversify.config'
import { TYPES } from '@/src/config/types'
import { UserController } from '@/src/controllers/UserController'
import { UserInsert } from '@/src/domain/repository/IUserRepository'

export async function POST(request: NextRequest) {
    try {
        // Get authentication from Clerk
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get the token from the authorization header
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')
        
        if (!token) {
            return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
        }

        // Parse the request body
        const userData: UserInsert = await request.json()

        // Validate that the user ID matches the authenticated user
        if (userData.user_id !== userId) {
            return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 })
        }

        // Get the user controller from DI container (server-side only)
        const userController = serverContainer.get<UserController>(TYPES.UserController)

        // Create the user
        const result = await userController.create(userData, token)

        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}