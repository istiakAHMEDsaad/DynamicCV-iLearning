import prisma from "../configs/prisma.js";

export const getOverviewStats = async (req, res) => {
  try {
    const totalCandidates = await prisma.user.count({
      where: { role: "CANDIDATE" },
    });
    const totalRecruiters = await prisma.user.count({
      where: { role: "RECRUITER" },
    });
    const totalPositions = await prisma.position.count();
    const totalCVs = await prisma.cV.count();

    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const cvsLast24h = await prisma.cV.count({
      where: { createdAt: { gte: yesterday } },
    });

    const latestPositions = await prisma.position.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { cvs: true } } },
    });

    const popularPositions = await prisma.position.findMany({
      take: 5,
      orderBy: { cvs: { _count: "desc" } },
      include: { _count: { select: { cvs: true } } },
    });

    const allPositions = await prisma.position.findMany({
      select: { projectTags: true },
    });
    const tagMap = {};
    allPositions.forEach((pos) => {
      pos.projectTags.forEach((tag) => {
        const normalized = tag.trim().toLowerCase();
        if (normalized) {
          tagMap[normalized] = (tagMap[normalized] || 0) + 1;
        }
      });
    });

    const tagCloud = Object.entries(tagMap)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    return res.status(200).json({
      success: true,
      stats: {
        totalCandidates,
        totalRecruiters,
        totalPositions,
        totalCVs,
        cvsLast24h,
      },
      latestPositions,
      popularPositions,
      tagCloud,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to load overview statistics." });
  }
};
