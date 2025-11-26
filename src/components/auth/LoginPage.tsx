import { SignIn } from '@clerk/clerk-react';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Fresh Logo */}
          <div className="mb-8">
            <img
              src="/fresh-logo.svg"
              alt="Fresh Consulting"
              className="h-20 mx-auto"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-darkest mb-2">
            Requirements Manager
          </h1>
          <p className="text-gray-mid mb-8">
            Manage your project requirements with confidence
          </p>

          {/* Clerk Sign In Component */}
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none"
              }
            }}
          />

          {/* Footer */}
          <p className="mt-8 text-sm text-gray-mid">
            Fresh Consulting Requirements Management System
          </p>
        </div>
      </div>
    </div>
  );
}