import { PostCard } from "@/components/custom/post-card";
import Image from "next/image";
import CreatePost from "@/components/custom/create-post";
import PostList from "@/components/custom/all-posts";
export default function Home() {
  return (
    <main className="container pt-10">
      <div className=" ">
        <CreatePost />
        {/* <PostCard />  */}
        <PostList />
      </div>
    </main>
  );
}
