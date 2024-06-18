"use client";
import { useConnection } from "arweave-wallet-kit";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";

const { dryrun } = require("@permaweb/aoconnect");

interface Post {
  ID: string;
  Title: string;
  Description: string;
  Author: string;
}

const PostList: React.FC = () => {
  const { connected } = useConnection();
  const processId = "rkFzXJCOWKN505YkAey1-q8odNeYxCH3UKKUDmoEdiI";
  const [isFetching, setIsFetching] = useState(false);
  const [postList, setPostList] = useState<any[]>([]);

  useEffect(() => {
    const syncAllPosts = async () => {
      if (!connected) {
        return;
      }

      setIsFetching(true);
      try {
        const result = await dryrun({
          process: processId,
          data: "",
          tags: [{ name: "Action", value: "GetPosts" }],
          anchor: "1234",
        });

        console.log("Dry run result", result);

        const filteredResult = result.Messages.map((message: any) => {
          const parsedData = JSON.parse(message.Data);
          console.log("Parsed data", parsedData);
          return parsedData;
        });

        console.log("Filtered result", filteredResult);

        setPostList(filteredResult);
      } catch (error) {
        console.log("Error fetching posts", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (connected) {
      syncAllPosts();
    }
  }, [connected]);

  return (
    <div className="mt-5">
      <h1 className="text-3xl font-polysans">Recent Posts</h1>
      {isFetching ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {postList &&
            postList.length > 0 &&
            postList[0].map((post: Post) => (
              <PostCard key={post.ID} post={post} />
            ))}
        </div>
      )}
    </div>
  );
};

const PostCard = ({ post }: { post: Post }) => {
  const { connected } = useConnection();
  const deletePost = async () => {
    if (!connected) {
      return;
    }

    try {
      const result = await dryrun({
        process: "rkFzXJCOWKN505YkAey1-q8odNeYxCH3UKKUDmoEdiI",
        data: "",
        tags: [
          { name: "Action", value: "DeletePost" },
          { name: "Post-Id", value: post.ID },
        ],
        anchor: "1234",
      });

      console.log("Delete post result", result);

      // Refresh the post list after deletion
    } catch (error) {
      console.log("Error deleting post", error);
    }
  };
  return (
    <div className=" bg-card p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold">{post.Title}</h2>
      <p>{post.Description}</p>
      <p>By: {post.Author}</p>
    </div>
  );
};

export default PostList;
