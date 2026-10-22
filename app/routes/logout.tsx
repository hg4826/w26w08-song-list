import { redirect } from 'react-router'
import { useAuthStore } from "~/lib/auth-store";

// 화면 없이 로그아웃 처리만 하는 라우트 (<Form method="post" action="/logout">)
export async function clientAction() {
  await useAuthStore.getState().signOut()
  return redirect("/login")
}

// 주소창으로 직접 들어오면 리스트로 돌려보냄
export async function clientLoader() {
  return redirect("/")
}
