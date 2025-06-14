"use client";
import { Button } from "../ui/button";
import { useState } from "react";
import { logout } from "@/actions/auth/sign-out";
import { ClassicLoader } from "@/components/classic-loader";

export const SignOut = () => {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await logout();
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
        variant="outline"
        onClick={handleSignOut}
        disabled={loading}
      >
        {loading ? <ClassicLoader /> : "Sign Out"}
      </Button>
    </div>
  );
};
