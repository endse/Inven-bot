export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        {children}
      </div>
    </div>
  );
}
