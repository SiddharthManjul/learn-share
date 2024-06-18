import React, { useState, useEffect } from "react";
import axios from "axios";
import { useConnection } from "arweave-wallet-kit";

interface PostProps {
  postId: string;
}

interface PostData {
  ID: string;
  Title: string;
  Description: string;
  Author: string;
  Body: string;
}

const Post: React.FC<PostProps> = ({ postId }) => {
  const { connected } = useConnection();
  const processId = "rkFzXJCOWKN505YkAey1-q8odNeYxCH3UKKUDmoEdiI";
  const [post, setPost] = useState<PostData | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.post("YOUR_BACKEND_URL", {
          Action: "GetPost",
          "Post-Id": postId,
        });

        if (response.data && response.data.Action === "Get-Response") {
          setPost(JSON.parse(response.data.Data));
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{post.Title}</h1>
      <h2>By {post.Author}</h2>
      <p>{post.Description}</p>
      <div>{post.Body}</div>
    </div>
  );
};

export default Post;
