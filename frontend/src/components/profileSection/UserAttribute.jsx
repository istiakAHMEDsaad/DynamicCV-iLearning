import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function UserAttribute({ profile, attributesLibrary }) {
  const queryClient = useQueryClient();
  const [selectedAttrId, setSelectedAttrId] = useState("");
  const [attrValue, setAttrValue] = useState("");

  const filledAttributes = profile?.attributeValues || [];
  const availableAttributes = attributesLibrary.filter(
    (libAttr) =>
      !filledAttributes.some((filled) => filled.attributeId === libAttr.id),
  );

  const upsertProfile = useMutation({
    mutationFn: async (payload) =>
      await api.post("/profile/attributes", payload),
    onSuccess: () => {
      toast.success("Attribute saved!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSelectedAttrId("");
      setAttrValue("");
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to save attribute"),
  });

  const deleteProfile = useMutation({
    mutationFn: async (attrId) =>
      await api.delete(`/profile/attributes/${attrId}`),
    onSuccess: () => {
      toast.success("Attribute removed!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const handleAdd = () => {
    if (!selectedAttrId || !attrValue)
      return toast.error("Select an attribute and provide a value.");

    const targetAttr = attributesLibrary.find((a) => a.id === selectedAttrId);
    let payload = { attributeId: selectedAttrId };

    if (targetAttr.type === "NUMERIC") payload.numValue = parseFloat(attrValue);
    else if (targetAttr.type === "BOOLEAN")
      payload.boolValue = attrValue === "true";
    else payload.textValue = attrValue;

    upsertProfile.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex gap-4 items-end shadow-sm">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium dark:text-zinc-300">
            Select Attribute
          </label>

          <select
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 h-10"
            value={selectedAttrId}
            onChange={(e) => {
              setSelectedAttrId(e.target.value);
              setAttrValue("");
            }}
          >
            <option value="" className="dark:bg-zinc-900">
              Choose from Library
            </option>

            {availableAttributes.map((attr) => (
              <option
                key={attr.id}
                value={attr.id}
                className="dark:bg-zinc-900"
              >
                {attr.name} ({attr.type})
              </option>
            ))}
          </select>
        </div>

        {selectedAttrId && (
          <div className="flex-1 space-y-2 animate-in slide-in-from-left-4">
            <label className="text-sm font-medium dark:text-zinc-300">
              Value
            </label>
            {(() => {
              const attrDef = attributesLibrary.find(
                (a) => a.id === selectedAttrId,
              );
              if (attrDef?.type === "BOOLEAN") {
                return (
                  <select
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    value={attrValue}
                    onChange={(e) => setAttrValue(e.target.value)}
                  >
                    <option value="" className="dark:bg-zinc-900">
                      Select...
                    </option>
                    <option value="true" className="dark:bg-zinc-900">
                      Yes
                    </option>
                    <option value="false" className="dark:bg-zinc-900">
                      No
                    </option>
                  </select>
                );
              }
              if (attrDef?.type === "DROPDOWN") {
                return (
                  <select
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    value={attrValue}
                    onChange={(e) => setAttrValue(e.target.value)}
                  >
                    <option value="" className="dark:bg-zinc-900">
                      Select...
                    </option>
                    {attrDef.options.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="dark:bg-zinc-900"
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                );
              }
              return (
                <Input
                  type={attrDef?.type === "NUMERIC" ? "number" : "text"}
                  placeholder="Enter value..."
                  value={attrValue}
                  onChange={(e) => setAttrValue(e.target.value)}
                  className="dark:bg-zinc-950 dark:border-zinc-800 h-10"
                />
              );
            })()}
          </div>
        )}

        <Button
          onClick={handleAdd}
          disabled={!selectedAttrId || !attrValue || upsertProfile.isPending}
          className="dark:bg-zinc-50 dark:text-zinc-900"
        >
          {upsertProfile.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" /> Add
            </>
          )}
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        {filledAttributes.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
            No attributes filled yet. Select one from above.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filledAttributes.map((val) => {
              const actualValue =
                val.textValue ??
                val.numValue ??
                (val.boolValue !== null
                  ? val.boolValue
                    ? "Yes"
                    : "No"
                  : "N/A");
              return (
                <div
                  key={val.id}
                  className="p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {val.attribute.name}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {val.attribute.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-sm">
                      {actualValue}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProfile.mutate(val.attributeId)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserAttribute;
