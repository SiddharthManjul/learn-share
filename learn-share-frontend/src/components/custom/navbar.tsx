"use client";
import { ConnectButton, useConnection } from "arweave-wallet-kit";
import React, { useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "../ui/input";
const {
  createDataItemSigner,
  message,
  dryrun,
  result,
} = require("@permaweb/aoconnect");
function Navbar() {
  const { connected } = useConnection();
  const processId = "rkFzXJCOWKN505YkAey1-q8odNeYxCH3UKKUDmoEdiI";
  const [isFetching, setIsFetching] = React.useState(false);
  


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
           tags: [{ name: "Action", value: "CheckUserR" }],
           anchor: "1234",
         });

         console.log("Dry run result User", result);


         const filteredResult = result.Messages.map((message: any) => {
           const parsedData = JSON.parse(message.Data);
           console.log("Parsed data User", parsedData);
           return parsedData;
         });

         console.log("Filtered result", filteredResult);

         
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
    <div className="  top-5 p-2  px-5  bg-muted w-full  ">
      {/* center the div */}
      <div
        className=" container "
      >
        <div className="flex justify-between items-center">
          <h5 className="text-xl font-polysans">Learn Share</h5>
          <div className="flex gap-3 items-center">

          <ConnectButton
            profileModal={true}
            showBalance={true}
            showProfilePicture={true}
            />
          <ThemeToggle />
            </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
