import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        message: "No token provided"
      });

    }

    const token =
      authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.admin = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};

export default authMiddleware;