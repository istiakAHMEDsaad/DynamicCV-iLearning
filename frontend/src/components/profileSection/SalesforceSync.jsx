import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";
import { Cloud, Loader2 } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function SalesforceSync() {
  const [isOpen, setIsOpen] = useState(false);

  const [crmData, setCrmData] = useState({
    companyName: "",
    phone: "",
    jobTitle: "",
  });

  const syncMutation = useMutation({
    mutationFn: async (payload) => await api.post("/salesforce/sync", payload),

    onSuccess: (res) => {
      toast.success(res.data.message || "Synced successfully.");

      setIsOpen(false);

      setCrmData({
        companyName: "",
        phone: "",
        jobTitle: "",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.error || "Salesforce sync failed.");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="dark:bg-zinc-900 dark:border-zinc-800"
        >
          <Cloud className="mr-2 h-4 w-4 text-blue-500" />
          Sync to Salesforce
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] dark:bg-zinc-950 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle>Salesforce Integration</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-zinc-500">
            Provide additional information before sending this profile to
            Salesforce.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name *</label>

            <Input
              placeholder="Acme Corporation"
              value={crmData.companyName}
              onChange={(e) =>
                setCrmData({
                  ...crmData,
                  companyName: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job Title</label>

            <Input
              placeholder="Software Engineer"
              value={crmData.jobTitle}
              onChange={(e) =>
                setCrmData({
                  ...crmData,
                  jobTitle: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>

            <Input
              placeholder="+380..."
              value={crmData.phone}
              onChange={(e) =>
                setCrmData({
                  ...crmData,
                  phone: e.target.value,
                })
              }
            />
          </div>

          <Button
            className="w-full"
            disabled={syncMutation.isPending || !crmData.companyName}
            onClick={() => syncMutation.mutate(crmData)}
          >
            {syncMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit to Salesforce
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SalesforceSync;
