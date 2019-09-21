const express = require("express");

const bcrypt = require("bcryptjs");

const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const mailer = require('../../modules/mailer');

const authConfig = require("../../config/auth");

const User = require("../models/user");

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  });
}

router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    const user = await User.create(req.body);

    user.password = undefined;

    console.log("usuario criado");

    res.send({
      user,
      token: generateToken({
        id: user.id
      })
    });
  } catch (err) {
    console.log(err)
    return res.status(400).send({ error: "registration failed" });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) return res.status(400).send({ error: "User not found" });

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ error: "Invalid password" });

  user.password = undefined;

  res.send({
    user,
    token: generateToken({
      id: user.id
    })
  });
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send({ error: "user not found" });

    const token = crypto.randomBytes(20).toString("hex");

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(
      user.id,
      {
        $set: {
          passwordResetToken: token,
          passwordResetExpires: now
        }
      },
      { new: true, useFindAndModify: false }
    );
    mailer.sendMail({
      to: email,
      from: 'digo@rocketseat.com.br',
      template: 'auth/forgot_password',
      context: { token }
    }), (err) => {
      if (err)
        res.status(400).send({ error: 'cannot send forgot password email' })

      return res.send();
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: "Erro on forgot password, try again" });
  }
});

router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email })
      .select('+passwordResetToken passowrdResetExpires');

    if (!user)
      return res.status(400).send({ error: 'User not found' })

    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: 'Invalid Token' });

    const now = new Date();
    if (now > user.passwordResetExpires)
      return res.status(400).send({ error: 'Token expired generate a new one' })

    user.password = password;

    await user.save();

    res.send();

  } catch (err) {
    res.status(400).send({ error: 'Cannot reset password' })
  }
});

module.exports = app => app.use("/auth", router);
