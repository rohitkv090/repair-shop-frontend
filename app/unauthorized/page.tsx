'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-red-600">Unauthorized Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You do not have permission to access this page.</p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={() => router.push('/')}>
              Return to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

