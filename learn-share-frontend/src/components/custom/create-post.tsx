"use client";
import React from "react";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { Input } from "../ui/input";
const {
  createDataItemSigner,
  message,
  dryrun,
  result,
} = require("@permaweb/aoconnect");
import { Button } from "../ui/button";

export default function CreatePost() {
  const { connected } = useConnection();
  const processId = "rkFzXJCOWKN505YkAey1-q8odNeYxCH3UKKUDmoEdiI";
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [username, setUsername] = React.useState("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const onChangDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };  

  const registerUser = async () => {
    try {
      const res = await message({
        process: processId,
        tags: [{ name: "Action", value: "RegisterUser" }, {name: "Name", value: username}],
        //   signer: createDataItemSigner(window.arweaveWallet),
        data: "",
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log(res);

      const registerRes = await result({
        process: processId,
        message: res,
      });

      console.log(registerRes);
    } catch (e) {
      console.log(e);
    }
  };
  const createPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Send the message to create a post
      const messageParams = {
        process: processId,
        tags: [
          { name: "Action", value: "CreatePost" },
          { name: "Content-Type", value: "text/html" },
          { name: "Title", value: title },
          { name: "Description", value: description },
        ],
        data: title,
        signer: await createDataItemSigner((window as any).arweaveWallet),
      };

      const messageRes = await message(messageParams);

      console.log("Message response", messageRes);

      // Get the result of the message
      const resultRes = await result({
        process: processId,
        message: messageRes,
      });

      console.log("Result response", resultRes);
    } catch (error) {
      console.error("Error creating post", error);
    }
  };

  return (
    <div className="">
      <form onSubmit={createPost}>
        <Input
          type="text"
          placeholder="Title"
          value={title}
          onChange={onChange}
          required
        />
        <Input
          type="text"
          placeholder="Description"
          value={description}
          onChange={onChangDescription}
          required
        />

        <Button type="submit" className="">
          {" "}
          Create Post
        </Button>
      </form>
      <form action={registerUser}>
      <Input
          type="text"
          placeholder="Name"
          value={username}
          onChange={onChangeUsername}
          required
        />
      <Button type="submit" className="">
        {" "}
        Register User
      </Button>
      </form>
    </div>
  );
}
