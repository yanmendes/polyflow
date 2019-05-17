import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

import { User } from "../../../models/polyflow";
import { JWT_SECRET } from "../../../config";

export default {
  logout: async (_, __, { req, res }) => {
    await new Promise(res => req.session.destroy(() => res()));
    res.clearCookie("connect.sid");
    return true;
  },

  register: async (_, { email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashedPassword
    }).save();

    return true;
  },

  login: async (_, { email, password }, { res }) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return null;
    }

    const token = jwt.sign(
      {
        userId: user.id
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("auth-cookie", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    return user;
  }
};
