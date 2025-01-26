import { getPosthtmlBemLinter } from "pineglade-config";
import gulp from "gulp";
import lintspaces from "gulp-lintspaces";
import pinegladeW3c from "pineglade-w3c";
import postcss from "gulp-postcss";
import postcssBemLinter from "postcss-bem-linter";
import postcssReporter from "postcss-reporter";
import posthtml from "gulp-posthtml";
import server from "browser-sync";
import stylelint from "stylelint";

const isDev = process.env.NODE_ENV === "development";
const postCssReporterConfig = { clearAllMessages: true, throwError: !isDev };

const { src, watch, series, parallel } = gulp;

const checkLintspaces = () => lintspaces({ editorconfig: ".editorconfig" });
const reportLintspaces = () => lintspaces.reporter({ breakOnWarning: !isDev });

export const lintLayouts = () =>
  src("*.html")
    .pipe(checkLintspaces())
    .pipe(reportLintspaces())
    .pipe(posthtml([pinegladeW3c.getPosthtmlW3c({ forceOffline: true }), getPosthtmlBemLinter()]));

export const lintStyles = () =>
  src("css/**/*.css")
    .pipe(checkLintspaces())
    .pipe(reportLintspaces())
    .pipe(postcss([stylelint(), postcssBemLinter(), postcssReporter(postCssReporterConfig)]));

export const reload = (done) => {
  server.reload();
  done();
};

export const startServer = (done) => {
  server.init({
    cors: true,
    server: ".",
    ui: false
  });
  watch("*.html", series(lintLayouts, reload));
  watch("css/**/*.css", series(lintStyles, reload));

  done();
};

export const lint = parallel(lintLayouts, lintStyles);
export default series(lint, startServer);
