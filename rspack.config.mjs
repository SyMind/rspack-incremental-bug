import { defineConfig } from "@rspack/cli";
import { rspack, EntryPlugin } from "@rspack/core";
import path from "path";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["last 2 versions", "> 0.2%",  "not dead",  "Firefox ESR"];

class Plugin {
	apply(compiler) {
		let times = 0;

		compiler.hooks.finishMake.tapPromise("Plugin", async compilation => {
			console.log("Starting finishMake hook...");
			compilation.hooks.needAdditionalPass.tap("Plugin", () => {
				times += 1;
				return times == 1;
			});

			if (times === 0) {
				return Promise.resolve();
			}

			return new Promise(resolve => {
				const dependency = EntryPlugin.createDependency(path.resolve("./src/node_modules/foo/index.js"));
				compilation.addInclude(
					compiler.context,
					dependency,
					{ name: "main" },
					(err, module) => {
						if (err) {
							console.error("Error adding entry:", err);
						} else {
							console.log("Entry added successfully", module.identifier());
						}
						const exportsInfo = compilation.moduleGraph.getExportsInfo(module);
						exportsInfo.setUsedInUnknownWay("main");
						resolve();
					}
				)
			});
		});

		compiler.hooks.additionalPass.tap("Plugin", () => {
			console.log("Additional pass");
		});
	}
}

export default defineConfig({
	entry: {
		main: "./src/index.js"
	},
	module: {
		rules: [
			{
				test: /\.svg$/,
				type: "asset"
			},
			{
				test: /\.js$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "ecmascript"
								}
							},
							env: { targets }
						}
					}
				]
			}
		]
	},
	plugins: [
		// new rspack.HtmlRspackPlugin({ template: "./index.html" }),
		new Plugin(),
	],
	optimization: {
		minimize: false,
		minimizer: [
			new rspack.SwcJsMinimizerRspackPlugin(),
			new rspack.LightningCssMinimizerRspackPlugin({
				minimizerOptions: { targets }
			})
		]
	},
	experiments: {
		css: true,
		incremental: false
	},
	devServer: {
		hot: false,
		devMiddleware: {
			writeToDisk: true,
		}
	}
});
