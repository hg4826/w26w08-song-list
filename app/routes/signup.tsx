import type { Route } from "./+types/signup";
import { Form, Link, redirect, useNavigation } from 'react-router'
import { useAuthStore } from "~/lib/auth-store";

export function meta({}: Route.MetaArgs) {
  return [{ title: "회원가입" }];
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
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "")

  if (password !== passwordConfirm) {
    return { error: "비밀번호가 일치하지 않습니다." }
  }

  try {
    await useAuthStore.getState().signUp(email, password)
  } catch (e) {
    return { error: e instanceof Error ? e.message : "회원가입 실패" }
  }

  // 이메일 확인이 꺼져 있으면 바로 로그인됨
  if (useAuthStore.getState().session) {
    return redirect("/")
  }

  // 이메일 확인이 켜져 있으면 세션 없이 확인 메일만 발송됨
  return { message: `${email}로 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인하세요.` }
}

// 로딩 화면. HydrateFallback 이름 정해져 있음
export function HydrateFallback() {
  return <div>로그인 세션 연결 중...</div>
}

export default function Signup({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="mx-auto max-w-sm p-6">
      <h2 className="mb-4 text-xl font-bold">회원가입</h2>
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
          placeholder="비밀번호 (6자 이상)"
          minLength={6}
          required
          className="rounded border px-3 py-2"
        />
        <input
          name="passwordConfirm"
          type="password"
          placeholder="비밀번호 확인"
          minLength={6}
          required
          className="rounded border px-3 py-2"
        />
        {actionData && "error" in actionData && (
          <p className="text-sm text-red-500">{actionData.error}</p>
        )}
        {actionData && "message" in actionData && (
          <p className="text-sm text-green-600">{actionData.message}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "가입 중..." : "회원가입"}
        </button>
      </Form>
      <p className="mt-4 text-sm">
        이미 계정이 있나요? <Link to="/login" className="text-blue-500 underline">로그인</Link>
      </p>
    </div>
  )
}
