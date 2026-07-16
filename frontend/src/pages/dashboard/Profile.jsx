import UserAttribute from "@/components/profileSection/UserAttribute";
import ProjectsSection from "@/components/profileSection/ProjectsSection";
import UserInformation from "@/components/profileSection/UserInformation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/profile/me");
      return res.data.profile;
    },
  });

  const { data: attributes = [], isLoading: loadingAttributes } = useQuery({
    queryKey: ["attributes"],
    queryFn: async () => {
      const res = await api.get("/attributes");
      return res.data.attributes;
    },
  });

  if (loadingProfile || loadingAttributes) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          My Profile
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage your information, attribute, and projects.
        </p>
      </div>

      <Tabs defaultValue="me" className="w-full">
        <TabsList className="grid w-full grid-cols-3 dark:bg-zinc-900 pb-10">
          <TabsTrigger value="me" className="py-1.5">
            Information
          </TabsTrigger>
          <TabsTrigger value="info" className="py-1.5">
            Attribute
          </TabsTrigger>
          <TabsTrigger value="projects" className="py-1.5">
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="me" className="mt-6">
          <UserInformation initialData={profile} />
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <UserAttribute profile={profile} attributesLibrary={attributes} />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectsSection projects={profile?.projects || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
