"use client";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { useState } from "react";
import { Loader } from "../loader";

export const SignOut = () => {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full cursor-pointer">
      <Button
        className="w-full cursor-pointer"
        variant="destructive"
        onClick={handleSignOut}
      >
        {loading ? <Loader /> : "Sign Out"}
      </Button>
    </div>
  );
};
