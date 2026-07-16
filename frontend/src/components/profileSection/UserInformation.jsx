import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { XCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "../ui/input";

function UserInformation({ initialData }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: initialData?.user?.firstName || "",
    lastName: initialData?.user?.lastName || "",
    location: initialData?.location || "",
    photoUrl: initialData?.photoUrl || "",
    version: initialData?.version || 1,
  });

  const [saveStatus, setSaveStatus] = useState("idle");
  const timeoutRef = useRef(null);

  const updateProfile = useMutation({
    mutationFn: async (payload) => await api.put("/profile/me", payload),
    onSuccess: (data) => {
      setSaveStatus("saved");
      setFormData((prev) => ({ ...prev, version: data?.data.profile.version }));
      queryClient.setQueryData(["profile"], (old) => ({
        ...old,
        ...data.data.profile,
        user: {
          ...old.user,
          firstName: formData.firstName,
          lastName: formData.lastName,
        },
      }));
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: (err) => {
      setSaveStatus("error");
      if (err.response?.status === 409) {
        toast.error("Conflict detected! Someone else updated this profile!");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      } else {
        toast.error("Auto-save failed.");
      }
    },
  });

  useEffect(() => {
    if (
      formData.firstName === initialData?.user?.firstName &&
      formData.location === initialData?.location
    )
      return;

    setSaveStatus("saving");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      updateProfile.mutate(formData);
    }, 5000);

    return () => clearTimeout(timeoutRef.current);
  }, [
    formData.firstName,
    formData.lastName,
    formData.location,
    formData.photoUrl,
  ]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium dark:text-zinc-50">Information</h3>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Auto-save every 5 seconds.
          </p>
        </div>

        <div className="flex items-center text-sm font-medium">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-500" />{" "}
              <span className="text-amber-500">Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />{" "}
              <span className="text-emerald-500">Saved</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <XCircle className="h-4 w-4 mr-2 text-red-500" />{" "}
              <span className="text-red-500">Error</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium dark:text-zinc-300">
            First Name
          </label>

          <Input
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="dark:bg-zinc-950 dark:border-zinc-800 h-10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-zinc-300">
            Last Name
          </label>

          <Input
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="dark:bg-zinc-950 dark:border-zinc-800 h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium dark:text-zinc-300">
          Location
        </label>

        <Input
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className="dark:bg-zinc-950 dark:border-zinc-800 h-10"
        />
      </div>
    </div>
  );
}

export default UserInformation;
