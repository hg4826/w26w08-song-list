import type { Route } from "./+types/login";
import { Form, Link, redirect, useNavigation } from 'react-router'
import { useAuthStore } from "~/lib/auth-store";

export function meta({}: Route.MetaArgs) {
  return [{ title: "로그인" }];
}

export async function clientLoader() {
  // 이미 로그인되어 있으면 리스트로 이동
  if (await useAuthStore.getState().initSession()) {
    return redirect("/")
  }
  return null
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData()
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  try {
    await useAuthStore.getState().signIn(email, password)
  } catch (e) {
    return { error: e instanceof Error ? e.message : "로그인 실패" }
  }

  return redirect("/")
}

// 로딩 화면. HydrateFallback 이름 정해져 있음
export function HydrateFallback() {
  return <div>로그인 세션 연결 중...</div>
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="mx-auto max-w-sm p-6">
      <h2 className="mb-4 text-xl font-bold">로그인</h2>
      <Form method="post" className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="이메일"
          required
          className="rounded border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          required
          className="rounded border px-3 py-2"
        />
        {actionData?.error && (
          <p className="text-sm text-red-500">{actionData.error}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </Form>
      <p className="mt-4 text-sm">
        계정이 없나요? <Link to="/signup" className="text-blue-500 underline">회원가입</Link>
      </p>
    </div>
  )
}
