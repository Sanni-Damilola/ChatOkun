import express, { Router } from "express";
import {
  createUser,
  deleteUser,
  getOneUser,
  getUsers,
  singinUser,
  updateUser,
} from "../controller/userController";

const router: Router = express.Router();

router.route("/get-user").get(getUsers);
router.route("/:userID/get-one-user").get(getOneUser);
router.route("/:userID/update-user").patch(updateUser);
router.route("/:userID/delete-user").delete(deleteUser);
router.route("/create-user").post(createUser);
router.route("/sign-in-user").post(singinUser);

export default router;
