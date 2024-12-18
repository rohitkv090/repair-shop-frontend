import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
      <p className="text-xl mb-8">You do not have permission to access this page.</p>
      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  )
}

