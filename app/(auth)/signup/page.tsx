import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpForm } from "@/components/signupform";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full max-sm:px-4 sm:max-w-md">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-900">
              Create your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SignUpForm />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/signin"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
