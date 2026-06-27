import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/db";
import { ENV } from "../utils/env";

const tokenGen = (id, role) => {
  return jwt.sign({ id, role }, ENV.JWT_SECRET, { expiresIn: "3d" });
};

// register user
export const registerUser = async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  try {
    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        firstName,
        lastName,
        role: role || "CANDIDATE",
      },
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: tokenGen(user.id, user.role),
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: tokenGen(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
