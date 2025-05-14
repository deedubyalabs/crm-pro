import LoginForm from "./login-form"

export const metadata = {
  title: "Login | HomePro One",
  description: "Login to your HomePro One account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">HomePro One</h1>
          <p className="text-gray-600">Home Service Management Platform</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
