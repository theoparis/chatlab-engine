import typescript from "@rollup/plugin-typescript";
// import dts from "rollup-plugin-dts";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

export default {
    input: "./src/index.ts",
    output: {
        file: "dist/index.js",
        format: "iife"
    },
    plugins: [
        resolve({
            extensions: [".js", ".ts"],
            browser: true
        }),
        typescript({ target: "ES6" }),
        serve(), // index.html should be in root of project
        livereload({ watch: "dist" })
    ]
};
