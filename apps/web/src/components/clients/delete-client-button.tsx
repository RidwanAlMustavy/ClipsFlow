"use client";

import { useState } from "react";
import { deleteClient } from "@/app/actions/clients";

interface Props {
  clientId: string;
}

export function DeleteClientButton({ clientId }: Props) {
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this client? This action cannot be undone and will delete all associated users and assets.")) return;

    setIsPending(true);
    try {
      const result = await deleteClient(clientId);
      if (result?.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete client");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm ml-4"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
