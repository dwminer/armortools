
let plugin = Plugin.create();
let h1 = new Handle();
let h2 = new Handle();

let slots = ["base", "occ", "rough", "nor"];
let breakdown = null;

plugin.drawUI = function(ui) {
	if (Zui.panel(h1, "Texture Breakdown")) {

		ui.g.end();
		drawBreakdown();
		ui.g.begin(false);

		// Zui.row([1 / 4]);
		// Zui.combo(h2, ["Material", "Viewport"], "Type");

		Zui.image(breakdown);
		if (ui.isHovered && ui.inputReleasedR) {
			let x = ui.inputX - ui._windowX;
			let w = ui._windowW / slots.length;
			let i = (x / w) | 0;
			UIMenu.draw(function(ui) {
				Zui.text(slots[i], 2, ui.t.HIGHLIGHT_COL);
				if (Zui.button("Delete", 0)) {
					slots.splice(i, 1);
				}
			}, 2);
		}

		Zui.row([1 / 4, 1 / 4]);

		if (Zui.button("Add")) {
			UIMenu.draw(function(ui) {
				Zui.text("Channel", 2, ui.t.HIGHLIGHT_COL);
				if (Zui.button("Base Color", 0)) { slots.push("base"); }
				if (Zui.button("Occlusion", 0)) { slots.push("occ"); }
				if (Zui.button("Roughness", 0)) { slots.push("rough"); }
				if (Zui.button("Metallic", 0)) { slots.push("metal"); }
				if (Zui.button("Normal Map", 0)) { slots.push("nor"); }
			}, 6);
		}

		if (Zui.button("Export")) {
			UIFiles.show("png", true, false, function(path) {
				Base.notifyOnNextFrame(function() {
					var f = UIFiles.filename;
					if (f === "") f = "untitled";
					if (!f.endsWith(".png")) f += ".png";
					Krom.writePng(path + Path.sep + f, breakdown.getPixels(), breakdown.get_width(), breakdown.get_height(), 2);
				});
			});
		}
	}
}

function drawBreakdown(type) {
	if (breakdown === null) {
		breakdown = core.Image.createRenderTarget(4096, 4096);
	}
	let g2 = breakdown.get_g2();
	g2.begin(true, 0xff000000);
	g2.disableScissor();

	if (h2.position === 0) { // Material
		var lay = Context.raw.layer;
		for (let i = 0; i < slots.length; ++i) {
			g2.set_pipeline(UIView2D.pipe);
			let image = lay.texpaint;
			let channel = 0;
			if (slots[i] === "occ") {
				image = lay.texpaint_pack;
				channel = 1;
			}
			else if (slots[i] === "rough") {
				image = lay.texpaint_pack;
				channel = 2;
			}
			else if (slots[i] === "metal") {
				image = lay.texpaint_pack;
				channel = 3;
			}
			else if (slots[i] === "nor") {
				image = lay.texpaint_nor;
				channel = 5;
			}
			breakdown.get_g4().setInt(UIView2D.channelLocation, channel);
			var step_source = image.get_width() / slots.length;
			var step_dest = breakdown.get_width() / slots.length;
			g2.drawScaledSubImage(image, step_source * i, 0, step_source, image.get_height(), step_dest * i, 0, step_dest, breakdown.get_height());
			g2.end(); // Flush
			g2.begin(false);
		}
	}
	else { // Viewport
	}

	g2.end();
}
