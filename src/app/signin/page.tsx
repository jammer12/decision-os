import { SignInForm } from "./signin-form";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params.next ?? "/";

  return <SignInForm next={next} />;
}
