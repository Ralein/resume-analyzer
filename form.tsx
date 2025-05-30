import { useFormState, useFormStatus } from "react-dom"

async function submitEmail(prevState: any, formData: FormData) {
  "use server"
  const email = formData.get("email")

  if (!email || typeof email !== "string") {
    return {
      success: false,
      message: "Invalid email address.",
    }
  }

  // Simulate an API call
  await new Promise((resolve) => setTimeout(resolve, 2000))

  if (email.endsWith("@example.com")) {
    return {
      success: false,
      message: "This email is not allowed.",
    }
  }

  return {
    success: true,
    message: `Email ${email} submitted successfully!`,
  }
}

export default function EmailForm() {
  const [state, formAction] = useFormState(submitEmail, null)
  const { pending } = useFormStatus()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Submit Email</h1>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {pending ? "Submitting..." : "Submit"}
          </button>
        </form>
        {state && (
          <div className={`mt-4 text-center ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</div>
        )}
      </div>
    </div>
  )
}
