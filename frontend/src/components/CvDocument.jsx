import { Badge } from "@/components/ui/badge";

function CvDocument({ cv }) {
  const profile = cv.profile;
  const position = cv.position;
  const user = profile.user;

  const relevantProjects = profile.projects
    .filter((proj) => {
      if (position.projectTags.length === 0) return true;
      return proj.tags.some((tag) =>
        position.projectTags
          .map((t) => t.toLowerCase())
          .includes(tag.toLowerCase()),
      );
    })
    .slice(0, position.maxProjects);

  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 sm:p-12 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-lg max-w-4xl mx-auto space-y-8 font-sans">
      {/* header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mt-2">
            {position.title} Candidate
          </p>
        </div>
        <div className="text-right text-sm space-y-1 text-zinc-500 dark:text-zinc-400">
          <p>{user.email}</p>
          <p>{profile.location}</p>
        </div>
      </div>

      {/* position requirment */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">
          Attributes
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {position.requirements.map((req) => {
            const candidateValue = profile.attributeValues.find(
              (attr) => attr.attributeId === req.attributeId,
            );

            let actualValue = candidateValue
              ? (candidateValue.textValue ??
                candidateValue.numValue ??
                (candidateValue.boolValue !== null
                  ? candidateValue.boolValue
                    ? "Yes"
                    : "No"
                  : null))
              : null;

            return (
              <div
                key={req.id}
                className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-100 dark:border-zinc-800"
              >
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {req.attribute.name}
                </span>
                {actualValue !== null ? (
                  <span className="font-semibold">{actualValue}</span>
                ) : (
                  <Badge
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Missing Data
                  </Badge>
                )}
              </div>
            );
          })}
          {position.requirements.length === 0 && (
            <p className="text-sm text-zinc-500 italic">
              No specific attributes required for this role.
            </p>
          )}
        </div>
      </div>

      {/* project section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">
          Relevant Projects
        </h3>

        {relevantProjects.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">
            No relevant projects found matching the required tags.
          </p>
        ) : (
          <div className="space-y-6">
            {relevantProjects.map((proj) => (
              <div key={proj.id} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-lg font-bold">{proj.name}</h4>
                  <span className="text-sm text-zinc-500">
                    {new Date(proj.startDate).toLocaleDateString()} -{" "}
                    {proj.endDate
                      ? new Date(proj.endDate).toLocaleDateString()
                      : "Present"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {proj.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-zinc-100 dark:bg-zinc-800"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 whitespace-pre-wrap">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CvDocument;
