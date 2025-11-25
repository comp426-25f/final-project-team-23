import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { useRouter } from "next/router";
import PostCard from "@/components/post";
import { Card } from "@/components/ui/card";
import { api } from "@/utils/trpc/api";
import { Subject } from "@/server/models/auth";

type PostPageProps = { user: Subject };

export default function PostPage({ user }: PostPageProps) {
  const router = useRouter();
  const postId = router.query.id as string;
  const { data: post } = api.posts.getPost.useQuery({ postId: postId.toString() });

  return (
    <div className="flex w-full flex-row justify-center px-3">
      <div className="mt-4 mb-12 w-full md:w-[600px]">
        <div className="pb-3">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft /> Back to Feed
          </Button>
        </div>
        {post && (
          <Card>
            <PostCard user={user} post={post} />
          </Card>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: userData, error: userError } = await supabase.auth.getClaims();

  if (userError || !userData) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: { id: userData.claims.sub },
    },
  };
}
