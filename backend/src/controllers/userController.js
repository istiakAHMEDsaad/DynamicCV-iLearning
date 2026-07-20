import prisma from "../configs/prisma";

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: "desc" },
    });

    const safeUsers = users.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return res.status(200).json({ success: true, users: safeUsers });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users." });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    if (!["CANDIDATE", "RECRUITER", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified." });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    return res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update role." });
  }
};

export const toggleBlockStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.id === req.user.userId) {
      return res.status(400).json({ error: "You cannot block yourself." });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
      select: { id: true, isBlocked: true },
    });

    return res.status(200).json({
      success: true,
      message: updatedUser.isBlocked ? "User blocked." : "User unblocked.",
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to toggle block status." });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (id === req.user.userId) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own admin account from here." });
    }

    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "User deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete user." });
  }
};
