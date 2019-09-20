const nodemailer = require("nodemailer");

const path = require("path");

const hbs = require("nodemailer-express-handlebars");

const { host, port, user, pass } = require("../config/mail");

var transport = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass }
});

transport.use('compile', hbs({ // configurando transporte
  viewEngine: {
    viewEngine: 'handlebars',
    partialsDir: 'some/path',
    defaultLayout: false
  },
  viewPath: path.resolve("./src/resources/mail/"), //onde ficam as Views de templates de emails. (tem que partir da raiz absoluta)
  extName: '.html',
}));

module.exports = transport;
